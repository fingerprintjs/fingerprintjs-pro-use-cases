import type { NextRequest } from 'next/server';

/**
 * This middleware runs on every requests and redirects from fingerprinthub.com/* to demo.fingerprint.com/*
 */
export function middleware(request: NextRequest) {
  // Note: We need to read the hostname from a header because request.url, request.nextURL just say "localhost" on Digital Ocean
  const host = request.headers.get('host');
  if (host === 'fingerprinthub.com') {
    const newURL = new URL(request.nextUrl.pathname, 'https://demo.fingerprint.com');
    newURL.search = request.nextUrl.search;
    return Response.redirect(newURL, 301);
  }
  return undefined;
}
