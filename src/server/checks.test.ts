import { describe, expect, it } from 'vitest';
import {
  clientIpFromCloudFrontViewerAddress,
  clientIpFromXForwardedFor,
  getRequestClientIp,
  visitIpMatchesRequestIp,
} from './checks';

const TRUSTED_PROXY_COUNT = 2;
const CLOUDFRONT_HOP = '18.68.31.6';
const DO_HOP = '172.68.134.34';
const sampleIps = {
  ipv6: '2001:db8:3333:4444:5555:6666:7777:8888',
  ipv4: ['192.0.2.146', '192.1.2.122'],
};

const requestWithHeaders = (headers: Record<string, string>) =>
  ({
    headers: new Headers(Object.entries(headers)),
  }) as unknown as Request;

const honestXff = (clientIp: string) => `${clientIp}, ${CLOUDFRONT_HOP}, ${DO_HOP}`;
const spoofedXff = (spoof: string, clientIp: string) => `${spoof}, ${clientIp}, ${CLOUDFRONT_HOP}, ${DO_HOP}`;

describe('clientIpFromXForwardedFor', () => {
  it('takes the hop before the trusted proxies', () => {
    expect(clientIpFromXForwardedFor(honestXff(sampleIps.ipv4[0]), 2)).toBe(sampleIps.ipv4[0]);
  });

  it('ignores a client-supplied left-most value', () => {
    expect(clientIpFromXForwardedFor(spoofedXff(sampleIps.ipv4[1], sampleIps.ipv4[0]), 2)).toBe(sampleIps.ipv4[0]);
  });

  it('returns undefined when there are not enough hops', () => {
    expect(clientIpFromXForwardedFor(sampleIps.ipv4[0], 2)).toBeUndefined();
    expect(clientIpFromXForwardedFor(null, 2)).toBeUndefined();
  });

  it('takes the only hop when trustedProxyCount is 0', () => {
    expect(clientIpFromXForwardedFor(sampleIps.ipv4[0], 0)).toBe(sampleIps.ipv4[0]);
  });
});

describe('clientIpFromCloudFrontViewerAddress', () => {
  it('strips the TCP port from an IPv4 address', () => {
    expect(clientIpFromCloudFrontViewerAddress('192.0.2.146:57917')).toBe('192.0.2.146');
  });

  it('strips the TCP port from an IPv6 address', () => {
    expect(clientIpFromCloudFrontViewerAddress('[2001:db8::1]:443')).toBe('2001:db8::1');
  });
});

describe('getRequestClientIp', () => {
  it('prefers CloudFront-Viewer-Address over a spoofed X-Forwarded-For', () => {
    const ip = getRequestClientIp(
      requestWithHeaders({
        'cloudfront-viewer-address': `${sampleIps.ipv4[0]}:57917`,
        'x-forwarded-for': spoofedXff(sampleIps.ipv4[1], sampleIps.ipv4[0]),
      }),
      TRUSTED_PROXY_COUNT,
    );
    expect(ip).toBe(sampleIps.ipv4[0]);
  });
});

describe('visitIpMatchesRequestIp', () => {
  it('skips ipv6 addresses', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({ 'x-forwarded-for': honestXff(sampleIps.ipv6) }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns true if ipv4 matches', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({ 'x-forwarded-for': honestXff(sampleIps.ipv4[0]) }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns false if ipv4 does not match', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({ 'x-forwarded-for': honestXff(sampleIps.ipv4[1]) }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(false);
  });

  it('does not trust a spoofed left-most X-Forwarded-For value', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({ 'x-forwarded-for': spoofedXff(sampleIps.ipv4[0], sampleIps.ipv4[1]) }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(false);
  });

  it('does not skip the check for a non-IP left-most value', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({ 'x-forwarded-for': spoofedXff('spoof', sampleIps.ipv4[0]) }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });

  it('returns false when X-Forwarded-For is missing', () => {
    const result = visitIpMatchesRequestIp(sampleIps.ipv4[0], requestWithHeaders({}), TRUSTED_PROXY_COUNT);
    expect(result).toBe(false);
  });

  it('matches using CloudFront-Viewer-Address even if X-Forwarded-For is spoofed', () => {
    const result = visitIpMatchesRequestIp(
      sampleIps.ipv4[0],
      requestWithHeaders({
        'cloudfront-viewer-address': `${sampleIps.ipv4[0]}:59556`,
        'x-forwarded-for': spoofedXff(sampleIps.ipv4[1], sampleIps.ipv4[0]),
      }),
      TRUSTED_PROXY_COUNT,
    );
    expect(result).toBe(true);
  });
});
