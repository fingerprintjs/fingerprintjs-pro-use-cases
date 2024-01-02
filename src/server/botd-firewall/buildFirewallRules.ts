import { chunk } from '../../shared/utils';

/**
 * Cloudflare rule expressions are limited to [4096 characters](https://developers.cloudflare.com/ruleset-engine/rules-language/expressions/#maximum-rule-expression-length).
 * IPv6 maximum length is [45 characters](https://stackoverflow.com/questions/166132/maximum-length-of-the-textual-representation-of-an-ipv6-address) plus quotes and a space is 48.
 * "http.x_forwarded_for in {}" is 26 characters.
 * (4096 - 26) / 48 = 84
 * You can block 84 IP addresses in a single Cloudflare custom rule.
 * 5 custom rules on a free Cloudflare plan gets you 420 IP addresses you can block at any given time.
 * That is sufficient for the purposes of this demonstration.
 * If you need to, you can squeeze in more IPs by testing their actual length and also using a higher Cloudflare plan with more custom rules.
 * This strategy is applicable to any web application firewall solution configurable using an API. The limitations will vary depending on your cloud provider.
 */
const MAX_IPS_PER_RULE = 84;
const MAX_RULES = 5;
export const MAX_BLOCKED_IPS = MAX_IPS_PER_RULE * MAX_RULES; // 420

export type CloudflareRule = {
  action: string;
  description: string;
  expression: string;
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
