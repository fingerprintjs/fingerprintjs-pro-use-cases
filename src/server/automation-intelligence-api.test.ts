import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAiApiResult } from './automation-intelligence-api';
import { ORIGINAL_REQUEST_TARGET_HEADER } from './request-target';

const pageRequestHeaders = new Headers({
  'x-forwarded-for': '203.0.113.7',
  'user-agent': 'test-agent',
  cookie: 'session=secret',
  authorization: 'Bearer secret',
  'e2e-test-password': 'secret',
});

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('fetchAiApiResult', () => {
  it('sends the page request to the AI API without secret header values', async () => {
    const fetchMock = stubFetch(Response.json({ event_id: '1.abc', timestamp: 1, source: 'edge' }));

    const result = await fetchAiApiResult(pageRequestHeaders, '/playground');

    expect(result).toEqual({ event: { event_id: '1.abc', timestamp: 1, source: 'edge' } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^https:\/\/(eu\.|ap\.)?api\.fpjs\.io\/v4\/edge$/);
    expect(init.headers.Authorization).toMatch(/^Bearer .+/);
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ method: 'GET', ipv4_address: '203.0.113.7' });
    expect(body.headers).toContainEqual({ name: 'user-agent', value: 'test-agent' });
    for (const name of ['cookie', 'authorization', 'e2e-test-password']) {
      expect(body.headers).toContainEqual({ name, value: '' });
    }
  });

  it('does not send the internal request target header added by Proxy', async () => {
    const fetchMock = stubFetch(Response.json({ event_id: '1.abc', timestamp: 1, source: 'edge' }));

    await fetchAiApiResult(
      new Headers({ 'x-forwarded-for': '203.0.113.7', [ORIGINAL_REQUEST_TARGET_HEADER]: '/playground?a=1' }),
      '/playground?a=1',
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.headers.map((header: { name: string }) => header.name)).not.toContain(ORIGINAL_REQUEST_TARGET_HEADER);
  });

  it('sends PUBLIC_ORIGIN as the URL and Host instead of the origin server host', async () => {
    vi.stubEnv('PUBLIC_ORIGIN', 'https://demo.fingerprint.com');
    vi.resetModules();
    const { fetchAiApiResult } = await import('./automation-intelligence-api');
    const fetchMock = stubFetch(Response.json({ event_id: '1.abc', timestamp: 1, source: 'edge' }));

    await fetchAiApiResult(
      new Headers({ host: 'origin-server.example.com', 'x-forwarded-for': '203.0.113.7' }),
      '/playground',
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.url).toBe('https://demo.fingerprint.com/playground');
    expect(body.headers).toContainEqual({ name: 'host', value: 'demo.fingerprint.com' });
  });

  it('returns an error instead of throwing when the API fails', async () => {
    stubFetch(Response.json({ error: { code: 'wrong_region', message: 'wrong region' } }, { status: 403 }));
    expect(await fetchAiApiResult(pageRequestHeaders, '/playground')).toEqual({
      error: 'AI API returned 403 wrong_region',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timed out', 'TimeoutError')));
    expect(await fetchAiApiResult(pageRequestHeaders, '/playground')).toEqual({
      error: expect.stringContaining('timed out'),
    });
  });

  it('returns an error when there is no client IP', async () => {
    expect(await fetchAiApiResult(new Headers({ host: 'localhost:3000' }), '/playground')).toEqual({
      error: 'No client IP found in X-Forwarded-For.',
    });
  });
});
