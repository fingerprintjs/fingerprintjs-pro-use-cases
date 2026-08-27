import { describe, expect, it } from 'vitest';
import {
  clientIpFromXForwardedFor,
  getRequestClientIp,
  isLocalhostRequest,
  isLoopbackIp,
  visitIpMatchesRequestIp,
} from './checks';

const TRUSTED_PROXY_COUNT = 2;
const PROXY_HOP_A = '18.68.31.6';
const PROXY_HOP_B = '172.68.134.34';
const sampleIps = {
  ipv6: '2001:db8:3333:4444:5555:6666:7777:8888',
  ipv4: ['192.0.2.146', '192.1.2.122'],
};

const requestWithHeaders = (headers: Record<string, string>) =>
  ({
    headers: new Headers(Object.entries(headers)),
  }) as unknown as Request;

const honestXff = (clientIp: string) => `${clientIp}, ${PROXY_HOP_A}, ${PROXY_HOP_B}`;
const spoofedXff = (spoof: string, clientIp: string) => `${spoof}, ${clientIp}, ${PROXY_HOP_A}, ${PROXY_HOP_B}`;

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

describe('isLoopbackIp', () => {
  it('detects IPv4 and IPv6 loopback', () => {
    expect(isLoopbackIp('127.0.0.1')).toBe(true);
    expect(isLoopbackIp('::1')).toBe(true);
    expect(isLoopbackIp('::ffff:127.0.0.1')).toBe(true);
    expect(isLoopbackIp('192.0.2.146')).toBe(false);
  });
});

describe('isLocalhostRequest', () => {
  it('is true when Next only recorded a loopback hop', () => {
    expect(isLocalhostRequest(requestWithHeaders({ 'x-forwarded-for': '127.0.0.1' }))).toBe(true);
    expect(isLocalhostRequest(requestWithHeaders({ 'x-forwarded-for': '::1' }))).toBe(true);
    expect(isLocalhostRequest(requestWithHeaders({}))).toBe(true);
  });

  it('is false when a public hop is present', () => {
    expect(isLocalhostRequest(requestWithHeaders({ 'x-forwarded-for': honestXff(sampleIps.ipv4[0]) }))).toBe(false);
  });
});

describe('getRequestClientIp', () => {
  it('uses X-Forwarded-For after skipping trusted proxy hops', () => {
    const ip = getRequestClientIp(
      requestWithHeaders({ 'x-forwarded-for': honestXff(sampleIps.ipv4[0]) }),
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

  it('skips the check when forwarded IPs are missing (localhost with no XFF)', () => {
    const result = visitIpMatchesRequestIp(sampleIps.ipv4[0], requestWithHeaders({}), TRUSTED_PROXY_COUNT);
    expect(result).toBe(true);
  });

  it('skips the check for a Next.js localhost hop', () => {
    expect(visitIpMatchesRequestIp(sampleIps.ipv4[0], requestWithHeaders({ 'x-forwarded-for': '127.0.0.1' }))).toBe(
      true,
    );
    expect(visitIpMatchesRequestIp(sampleIps.ipv4[0], requestWithHeaders({ 'x-forwarded-for': '::1' }))).toBe(true);
  });
});
