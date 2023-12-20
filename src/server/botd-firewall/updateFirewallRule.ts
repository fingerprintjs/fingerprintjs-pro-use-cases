import { BlockedIpDbModel } from './saveBlockedIp';

/**
 * Rule expression is limited to [4096 characters](https://developers.cloudflare.com/ruleset-engine/rules-language/expressions/#maximum-rule-expression-length).
 * IPv6 Max length is [45 characters](https://stackoverflow.com/questions/166132/maximum-length-of-the-textual-representation-of-an-ipv6-address) plus quotes and a space is 48.
 * "http.x_forwarded_for in {}" is 26 characters.
 * (4096 - 26) / 48 = 84
 * You can block 84 IP addresses in a single Cloudflare custom rule.
 * That is sufficient for the purposes of this demonstration.
 * If you need to, you can squeeze in more IPs by testing their actual length and also use multiple custom rules depending on your Cloudflare plan.
 * This strategy is applicable to any Firewall solution editable using an API. The limitations will vary depending on your cloud provider.
 */
const MAX_IPS_PER_RULE = 84;

export const syncCloudflareBotFirewallRule = async () => {
  const blockedIps = await BlockedIpDbModel.findAll({
    order: [['timestamp', 'DESC']],
    limit: MAX_IPS_PER_RULE,
  });

  const ipList = blockedIps.map((ip) => `"${ip.ip}"`).join(' ');
  const ruleExpression = `http.x_forwarded_for in {${ipList}}`;

  await updateFirewallRule(ruleExpression);
};

async function updateFirewallRule(expression: string) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const ruleId = process.env.CLOUDFLARE_BLOCK_IP_RULE ?? '';
  // You can get your Cloudflare API token, zone ID and rule ID from your Cloudflare dashboard.
  // But you might need to call the API to find the custom ruleset ID. See getCustomRulesetId() below.
  const customRulesetId = process.env.CLOUDFLARE_RULESET_ID ?? '';

  const ruleBody = {
    description: `Fingerprint: Block IP addresses previously used by bots`,
    expression,
    action: 'block',
  };

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${customRulesetId}/rules/${ruleId}`;
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(ruleBody),
  };

  try {
    const blockAction = await (await fetch(url, options)).json();
    return blockAction.result;
  } catch (error) {
    console.error('error:' + error);
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
