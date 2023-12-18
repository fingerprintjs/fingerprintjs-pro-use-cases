import { NextApiRequest, NextApiResponse } from 'next';
// import * as dotenv from 'dotenv';
// dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = req.body;
    if (!body) {
      return new Response(null, { status: 400 });
    }

    await updateFirewallRule(body.ipAddress);

    return res.send({ status: 200 });
  } else {
    return res.send({ status: 405 });
  }
}

export async function getCustomRulesetId() {
  const rulesets: Array<any> = await getZoneRulesets();

  // one must deploy custom rules to the http_request_firewall_custom phase entry point ruleset https://developers.cloudflare.com/waf/custom-rules/create-api/
  const customRuleset = rulesets.find((item) => {
    return item.phase === 'http_request_firewall_custom';
  });

  return customRuleset.id;
}

export async function getRuleset(rulesetId: string) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${rulesetId}`;

  const options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
  };

  try {
    const ruleset = await (await fetch(url, options)).json();
    return ruleset;
  } catch (error) {
    console.error('error:' + error);
  }
}

async function getZoneRulesets() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`;

  const options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
  };

  try {
    const rulesets = await (await fetch(url, options)).json();
    return rulesets.result;
  } catch (error) {
    console.error('error:' + error);
  }
}

async function updateFirewallRule(ipAddress: string) {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN ?? '';
  const zoneId = process.env.CLOUDFLARE_ZONE_ID ?? '';
  const customRulesetId = process.env.CLOUDFLARE_RULESET_ID ?? '';

  const ruleBody = {
    description: `Firewall rule for ${ipAddress} created by Fingerprint.`,
    expression: `ip.src eq ${ipAddress}`,
    action: 'block',
  };

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${customRulesetId}/rules`;
  const options = {
    method: 'POST',
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
