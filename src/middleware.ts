import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware runs on every requests and redirects from fingerprinthub.com/* to demo.fingerprint.com/*
 */
export function middleware(request: NextRequest) {
  // To-do: Change to fingerprinthub.com
  if (request.nextUrl.hostname === 'staging.fingerprinthub.com') {
    const newURL = request.nextUrl.clone();
    newURL.host = 'demo.fingerprint.com';
    // Uncomment for testing on localhost
    // newURL.protocol = 'https';
    // newURL.port = '';
    return NextResponse.redirect(newURL);
  }
}
