// @vitest-environment node
// Proxy runs in Node. jsdom parses `\` in URLs differently, so this file would lock in the wrong redirect.
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

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
});
