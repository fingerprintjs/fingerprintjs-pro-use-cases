import { NextRequest, NextResponse } from 'next/server';
import { ORIGINAL_REQUEST_TARGET_HEADER } from './server/request-target';

/**
 * - Redirects fingerprinthub.com.
 * - Serves `/automation-intelligence` as the Automation Intelligence Playground page or JSON, based on the Accept header.
 * - Forwards original Automation Intelligence request targets.
 */
export function proxy(request: NextRequest) {
  // Note: We need to read the hostname from a header because request.url, request.nextURL just say "localhost" on Digital Ocean
  const host = request.headers.get('host');
  if (host === 'fingerprinthub.com') {
    // `new URL(pathname, origin)` drops origin when pathname starts with `//`.
    // https://url.spec.whatwg.org/#url-parsing
    const newURL = new URL('https://demo.fingerprint.com');
    newURL.pathname = request.nextUrl.pathname;
    newURL.search = request.nextUrl.search;
    return Response.redirect(newURL, 301);
  }

  const { pathname } = request.nextUrl;
  if (
    pathname !== '/automation-intelligence' &&
    pathname !== '/automation-intelligence.json' &&
    pathname !== '/automation-intelligence-playground'
  ) {
    return undefined;
  }
  // Pages and the JSON route send this URL to the AI API, not the one after a rewrite
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ORIGINAL_REQUEST_TARGET_HEADER, pathname + request.nextUrl.search);

  // - Browsers and AI agents ask for HTML, curl sends `*/*`.
  // - Next client navigation sends `RSC: 1` with `Accept: */*` and needs the page.
  // - Only the JSON response sends `Vary: Accept`. Next replaces Vary on pages. Both are `no-store`, so no cache mixes them up.
  const wantsPage = request.headers.get('accept')?.includes('text/html') || request.headers.has('rsc');
  if (pathname === '/automation-intelligence' && !wantsPage) {
    const jsonUrl = request.nextUrl.clone();
    jsonUrl.pathname = '/automation-intelligence.json';
    return NextResponse.rewrite(jsonUrl, { request: { headers: requestHeaders } });
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}
