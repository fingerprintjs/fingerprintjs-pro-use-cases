import { describe, expect, it } from 'vitest';
import { clientIpFromXForwardedFor, visitIpMatchesRequestIp } from './checks';

const TRUSTED_PROXY_COUNT = 1;
const PROXY_HOP = '203.0.113.1';
const sampleIps = {
  ipv6: '2001:db8:3333:4444:5555:6666:7777:8888',
  ipv4: ['192.0.2.146', '192.1.2.122'],
};

const requestWithXff = (xff: string) =>
  ({
    headers: new Headers([['x-forwarded-for', xff]]),
  }) as unknown as Request;

describe('clientIpFromXForwardedFor', () => {
  it('takes the hop before the trusted proxies', () => {
    expect(clientIpFromXForwardedFor(`${sampleIps.ipv4[0]}, ${PROXY_HOP}`, 1)).toBe(sampleIps.ipv4[0]);
  });

  it('ignores a client-supplied left-most value', () => {
    expect(clientIpFromXForwardedFor(`${sampleIps.ipv4[1]}, ${sampleIps.ipv4[0]}, ${PROXY_HOP}`, 1)).toBe(
      sampleIps.ipv4[0],
    );
  });

  it('returns undefined when there are not enough hops', () => {
    expect(clientIpFromXForwardedFor(sampleIps.ipv4[0], 1)).toBeUndefined();
    expect(clientIpFromXForwardedFor(null, 1)).toBeUndefined();
  });

  it('takes the only hop when trustedProxyCount is 0', () => {
    expect(clientIpFromXForwardedFor(sampleIps.ipv4[0], 0)).toBe(sampleIps.ipv4[0]);
  });
});

describe('visitIpMatchesRequestIp', () => {
  it('skips ipv6 addresses', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithXff(`${sampleIps.ipv6}, ${PROXY_HOP}`),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns true if ipv4 matches', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithXff(`${sampleIps.ipv4[0]}, ${PROXY_HOP}`),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns false if ipv4 does not match', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithXff(`${sampleIps.ipv4[1]}, ${PROXY_HOP}`),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(false);
  });

  it('does not trust a spoofed left-most X-Forwarded-For value', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithXff(`${sampleIps.ipv4[0]}, ${sampleIps.ipv4[1]}, ${PROXY_HOP}`),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(false);
  });

  it('does not skip the check for a non-IP left-most value', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithXff(`spoof, ${sampleIps.ipv4[0]}, ${PROXY_HOP}`),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns false when X-Forwarded-For is missing', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      { headers: new Headers() } as unknown as Request,
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(false);
  });
});
