import { chunk } from '../../shared/utils';
import { BlockedIpDbModel } from './blockedIpsDatabase';

/**
 * Rule expression is limited to [4096 characters](https://developers.cloudflare.com/ruleset-engine/rules-language/expressions/#maximum-rule-expression-length).
 * IPv6 Max length is [45 characters](https://stackoverflow.com/questions/166132/maximum-length-of-the-textual-representation-of-an-ipv6-address) plus quotes and a space is 48.
 * "http.x_forwarded_for in {}" is 26 characters.
 * (4096 - 26) / 48 = 84
 * You can block 84 IP addresses in a single Cloudflare custom rule.
 * 5 custom rules on a free Cloudflare plan gets you 420 IP addresses you can block at any given time.
 * That is sufficient for the purposes of this demonstration.
 * If you need to, you can squeeze in more IPs by testing their actual length and also using a higher Cloudflare plan with more custom rules.
 * This strategy is applicable to any Firewall solution editable using an API. The limitations will vary depending on your cloud provider.
 */
const MAX_IPS_PER_RULE = 84;
const MAX_RULES = 5;
const MAX_IPS = MAX_IPS_PER_RULE * MAX_RULES; // 420

export const getBlockedIps = async (): Promise<string[]> => {
  const blockedIps = await BlockedIpDbModel.findAll({
    order: [['timestamp', 'DESC']],
    limit: MAX_IPS,
  });
  return blockedIps.map((ip) => ip.ip);
};

export const buildFirewallRules = async (
  blockedIps: string[],
  maxIpsPerRule = MAX_IPS_PER_RULE,
): Promise<CloudflareRule[]> => {
  // Split the list of blocked IPs into chunks of MAX_IPS_PER_RULE length
  const chunks = chunk(blockedIps, maxIpsPerRule);

  // Build the rule expression for each chunk
  const ruleExpressions = chunks.map((chunk) => {
    const ipList = chunk.map((ip) => `"${ip}"`).join(' ');
    return `http.x_forwarded_for in {${ipList}}`;
  });

  // Build a rule from each rule expression
  const rules = ruleExpressions.map((expression, index) => ({
    action: 'block',
    description: `Block Bot IP addresses #${index + 1}`,
    expression,
  }));

  return rules;
};

type CloudflareRule = {
  action: string;
  description: string;
  expression: string;
};

export async function updateFirewallRuleset(rules: CloudflareRule[]) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  // You can get your Cloudflare API token, and zone ID from your Cloudflare dashboard.
  // But you might need to call the API to find the custom ruleset ID. See getCustomRulesetId() below.
  const customRulesetId = process.env.CLOUDFLARE_RULESET_ID ?? '';

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${customRulesetId}`;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      description: 'Custom ruleset for blocking Fingerprint-detected bot IPs',
      kind: 'root',
      name: 'default',
      phase: 'http_request_firewall_custom',
      rules,
    }),
  };

  const response = await fetch(url, options);
  if (response.ok) {
    return await response.json();
  } else {
    console.log(response.statusText, await response.json());
    throw new Error('Updating firewall ruleset failed', { cause: response.statusText });
  }
}

// You might need to call the Cloudflare API to find the custom ruleset ID, here is a helper for that.
// Once you have the ID, you can save it in your env variables to avoid having to retrieve it for every request.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getCustomRulesetId() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`;

  const options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
  };

  try {
    const rulesets = await (await fetch(url, options)).json();

    const customRuleset = rulesets.result.find((item: { phase: string }) => {
      return item.phase === 'http_request_firewall_custom';
    });

    console.log(customRuleset);
    return customRuleset.id;
  } catch (error) {
    console.error('error:' + error);
  }
}
