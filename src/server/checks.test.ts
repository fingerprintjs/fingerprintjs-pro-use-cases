import { beforeEach, describe, expect, it } from 'vitest';
import { checkIpAddressIntegrity } from './checks';
import { CheckResult } from './checkResult';

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
      const result = checkIpAddressIntegrity(
        {
          products: {
            identification: {
              // @ts-ignore Mocked test object
              data: {
                ip: sampleIps.ipv4[0],
              },
            },
          },
        },

        {
          headers: {
            'x-forwarded-for': sampleIps.ipv6[0],
          },
        },
      );
      expect(result).toBeFalsy();
    });

    it('should return undefined if ipv4 matches', () => {
      const result = checkIpAddressIntegrity(
        {
          products: {
            identification: {
              // @ts-ignore Mocked test object
              data: {
                ip: sampleIps.ipv4[0],
              },
            },
          },
        },
        {
          headers: {
            'x-forwarded-for': sampleIps.ipv4[0],
          },
        },
      );
      expect(result).toBeFalsy();
    });

    it('should return CheckResult if ipv4 does not match', () => {
      const result = checkIpAddressIntegrity(
        {
          products: {
            identification: {
              // @ts-ignore Mocked test object
              data: {
                ip: sampleIps.ipv4[0],
              },
            },
          },
        },
        {
          headers: {
            'x-forwarded-for': sampleIps.ipv4[1],
          },
        },
      );
      expect(result).toBeInstanceOf(CheckResult);
    });
  });
});
