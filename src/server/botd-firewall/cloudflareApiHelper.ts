import { getBlockedIps } from './blockedIpsDatabase';
import { CloudflareRule, buildFirewallRules } from './buildFirewallRules';

async function updateRulesetUsingCloudflareAPI(rules: CloudflareRule[]) {
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

// Construct updated firewall rules from the blocked IP database and apply them to your Cloudflare application
export const syncFirewallRuleset = async () => {
  const blockedIps = await getBlockedIps();
  const newRules = await buildFirewallRules(blockedIps);
  await updateRulesetUsingCloudflareAPI(newRules);
};

// You might need to call the Cloudflare API to find the custom ruleset ID, here is a helper for that.
// Once you have the ID, you can save it in your env variables to avoid having to retrieve it for every request.
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getCustomRulesetId() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  try {
    const rulesets = await (
      await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
      })
    ).json();

    const customRuleset = rulesets.result.find((item: { phase: string }) => {
      return item.phase === 'http_request_firewall_custom';
    });

    console.log(customRuleset);
    return customRuleset.id;
  } catch (error) {
    console.error('error:' + error);
  }
}
