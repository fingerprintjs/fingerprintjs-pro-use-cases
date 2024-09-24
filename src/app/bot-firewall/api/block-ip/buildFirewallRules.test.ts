import { buildFirewallRules } from './buildFirewallRules';
import { describe, expect, it } from 'vitest';

describe('buildFirewallRules', () => {
  it('should build a single firewall rule correctly', async () => {
    // Already assumed to be all unique due to how out database is set up
    const blockedIps = ['192.168.0.1', '10.0.0.1', '172.16.0.1'];
    const expectedRules = [
      {
        action: 'block',
        description: 'Block Bot IP addresses #1',
        expression: 'http.x_forwarded_for in {"192.168.0.1" "10.0.0.1" "172.16.0.1"}',
      },
    ];
    const rules = await buildFirewallRules(blockedIps);

    expect(rules).toEqual(expectedRules);
  });

  it('should build multiple firewall rules correctly', async () => {
    const blockedIps = [
      '68.237.223.37',
      '53.40.210.202',
      '140.184.133.152',
      '253.221.155.217',
      '195.43.16.78',
      '2.2.2.1',
      '2.2.2.2',
      '2.2.2.3',
      '2.2.2.4',
      '2.2.2.5',
      '3.3.3.1',
      '3.3.3.2',
      '3.3.3.3',
      '3.3.3.4',
      '3.3.3.5',
      '4.4.4.1',
      '4.4.4.2',
    ];
    const expectedRules = [
      {
        action: 'block',
        description: 'Block Bot IP addresses #1',
        expression:
          'http.x_forwarded_for in {"68.237.223.37" "53.40.210.202" "140.184.133.152" "253.221.155.217" "195.43.16.78"}',
      },
      {
        action: 'block',
        description: 'Block Bot IP addresses #2',
        expression: 'http.x_forwarded_for in {"2.2.2.1" "2.2.2.2" "2.2.2.3" "2.2.2.4" "2.2.2.5"}',
      },
      {
        action: 'block',
        description: 'Block Bot IP addresses #3',
        expression: 'http.x_forwarded_for in {"3.3.3.1" "3.3.3.2" "3.3.3.3" "3.3.3.4" "3.3.3.5"}',
      },
      {
        action: 'block',
        description: 'Block Bot IP addresses #4',
        expression: 'http.x_forwarded_for in {"4.4.4.1" "4.4.4.2"}',
      },
    ];
    const rules = await buildFirewallRules(blockedIps, 5);
    expect(rules).toEqual(expectedRules);
  });
});
