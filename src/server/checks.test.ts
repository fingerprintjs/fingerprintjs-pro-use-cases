import { beforeEach, describe, expect, it } from 'vitest';
import { visitIpMatchesRequestIp } from './checks';

describe('checks', () => {
  describe('checkIpAddressIntegrity', () => {
    beforeEach(() => {
      Object.assign(process.env, {
        NODE_ENV: 'production',
      });
    });
    const sampleIps = {
      ipv6: ['2001:db8:3333:4444:5555:6666:7777:8888.'],
      ipv4: ['192.0.2.146', '192.1.2.122'],
    };

    it('should skip ipv6 addresses', () => {
      const result = visitIpMatchesRequestIp(sampleIps.ipv4[0], {
        headers: new Headers([['x-forwarded-for', sampleIps.ipv6[0]]]),
      } as unknown as Request);
      expect(result).toBe(true);
    });

    it('should return true if ipv4 matches', () => {
      const result = visitIpMatchesRequestIp(sampleIps.ipv4[0], {
        headers: new Headers([['x-forwarded-for', sampleIps.ipv4[0]]]),
      } as unknown as Request);
      expect(result).toBe(true);
    });

    it('should return false if ipv4 does not match', () => {
      const result = visitIpMatchesRequestIp(sampleIps.ipv4[0], {
        headers: new Headers([['x-forwarded-for', sampleIps.ipv4[1]]]),
      } as unknown as Request);
      expect(result).toBe(false);
    });
  });
});
