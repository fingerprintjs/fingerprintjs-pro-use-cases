import { BlockedIpDbModel } from './saveBlockedIp';

export const syncCloudflareBotFirewallRule = async () => {
  const blockedIps = await BlockedIpDbModel.findAll();
  const ruleExpression = `http.x_forwarded_for in {${blockedIps.map((ip) => `"${ip.ip}"`).join(' ')}}`;

  console.log(ruleExpression);
  const result = await updateFirewallRule(ruleExpression);
  console.log(result);
};

async function updateFirewallRule(expression: string) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const customRulesetId = process.env.CLOUDFLARE_RULESET_ID ?? '';
  const ruleId = process.env.CLOUDFLARE_BLOCK_IP_RULE ?? '';

  const ruleBody = {
    description: `Blocked IPs previously used by bots`,
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
