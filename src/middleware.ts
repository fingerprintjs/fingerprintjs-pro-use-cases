import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware runs on every requests and redirects from fingerprinthub.com/* to demo.fingerprint.com/*
 */
export function middleware(request: NextRequest) {
  // Note: We need to read the hostname from a header, request.url, request.nextURL just say "localhost" on Digital
  const host = request.headers.get('host');
  // To-do: Change to fingerprinthub.com when the switch happens
  if (host === 'staging.fingerprinthub.com') {
    const newURL = request.nextUrl.clone();
    newURL.host = 'demo.fingerprint.com';
    newURL.protocol = 'https';
    newURL.port = '';
    return NextResponse.redirect(newURL);
  }
}
