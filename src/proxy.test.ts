// @vitest-environment node
// Proxy runs in Node. jsdom parses `\` in URLs differently, so this file would lock in the wrong redirect.
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';
import { ORIGINAL_REQUEST_TARGET_HEADER } from './server/request-target';

function redirectLocation(url: string) {
  const response = proxy(new NextRequest(url, { headers: { host: 'fingerprinthub.com' } }));
  expect(response?.status).toBe(301);
  return response?.headers.get('location');
}

describe('proxy', () => {
  it('redirects fingerprinthub.com to demo.fingerprint.com', () => {
    expect(redirectLocation('https://fingerprinthub.com/playground?a=1')).toBe(
      'https://demo.fingerprint.com/playground?a=1',
    );
  });

  it('keeps the demo host when the path starts with //', () => {
    expect(redirectLocation('https://fingerprinthub.com//evil.example/foo?a=1')).toBe(
      'https://demo.fingerprint.com//evil.example/foo?a=1',
    );
    // Node parses `\` as `/` before Proxy runs, so this pathname is also `//evil.example`.
    expect(redirectLocation('https://fingerprinthub.com/\\evil.example?a=1')).toBe(
      'https://demo.fingerprint.com//evil.example?a=1',
    );
  });

  it('forwards the original request target to the Automation Intelligence Playground', () => {
    const response = proxy(new NextRequest('https://demo.fingerprint.com/automation-intelligence-playground?a=%31'));
    // NextResponse.next() passes request header overrides to the page as `x-middleware-request-*` headers
    expect(response?.headers.get(`x-middleware-request-${ORIGINAL_REQUEST_TARGET_HEADER}`)).toBe(
      '/automation-intelligence-playground?a=%31',
    );
  });

  describe('/automation-intelligence', () => {
    const proxyWithHeaders = (headers: Record<string, string>) =>
      proxy(new NextRequest('https://demo.fingerprint.com/automation-intelligence?a=%31', { headers }));
    const rewriteTarget = (response: Response | undefined) => response?.headers.get('x-middleware-rewrite');

    it('rewrites clients that do not accept HTML to the JSON route, keeping the original target', () => {
      const response = proxyWithHeaders({ accept: '*/*' });
      expect(rewriteTarget(response)).toBe('https://demo.fingerprint.com/automation-intelligence.json?a=%31');
      expect(response?.headers.get(`x-middleware-request-${ORIGINAL_REQUEST_TARGET_HEADER}`)).toBe(
        '/automation-intelligence?a=%31',
      );
    });

    it('serves the page to browsers and Next client navigation', () => {
      expect(rewriteTarget(proxyWithHeaders({ accept: 'text/html,*/*;q=0.8' }))).toBeNull();
      expect(rewriteTarget(proxyWithHeaders({ accept: '*/*', rsc: '1' }))).toBeNull();
    });
  });

  it('leaves the Playground alone', () => {
    expect(proxy(new NextRequest('https://demo.fingerprint.com/playground'))).toBeUndefined();
  });
});
