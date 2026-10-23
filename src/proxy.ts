import { NextRequest, NextResponse } from 'next/server';
import { ORIGINAL_REQUEST_TARGET_HEADER } from './server/request-target';

/**
 * Redirects fingerprinthub.com and forwards original Playground request targets.
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
  if (['/playground', '/playground/embed'].includes(request.nextUrl.pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ORIGINAL_REQUEST_TARGET_HEADER, request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  return undefined;
}
