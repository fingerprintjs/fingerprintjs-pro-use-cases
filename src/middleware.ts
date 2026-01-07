import { NextRequest, NextResponse } from 'next/server';

/**
 * This middleware runs on every requests and redirects from fingerprinthub.com/* to demo.fingerprint.com/*
 */
export function middleware(request: NextRequest) {
  const cspHeader = `
    worker-src blob:;
  `;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  // Note: We need to read the hostname from a header because request.url, request.nextURL just say "localhost" on Digital Ocean
  const host = request.headers.get('host');
  if (host === 'fingerprinthub.com') {
    const newURL = new URL(request.nextUrl.pathname, 'https://demo.fingerprint.com');
    newURL.search = request.nextUrl.search;
    return Response.redirect(newURL, 301);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}
