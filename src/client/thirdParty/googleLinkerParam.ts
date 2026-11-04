'use client';

import { useEffect } from 'react';

/**
 * Google Analytics cross-domain measurement appends a `_gl` linker parameter to links from fingerprint.com to
 * demo.fingerprint.com. It is noise in the address bar and leaks into anything the visitor copies or shares.
 * https://support.google.com/analytics/answer/10071811
 *
 * Removing it before the Google tag reads it is safe: both sites are subdomains of fingerprint.com and the Google
 * cookies (`_ga`, `_gcl_au`) are set on `.fingerprint.com`, so the tag picks up the same visitor from the shared
 * cookies anyway.
 */
export const GOOGLE_LINKER_QUERY_PARAM = '_gl';

/**
 * Returns `url` without the Google linker parameter as a relative URL,
 * or `undefined` when the parameter is not present.
 */
export function urlWithoutGoogleLinkerParam(url: URL): string | undefined {
  if (!url.searchParams.has(GOOGLE_LINKER_QUERY_PARAM)) {
    return undefined;
  }

  const cleanUrl = new URL(url);
  cleanUrl.searchParams.delete(GOOGLE_LINKER_QUERY_PARAM);

  return `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`;
}

/** Removes the Google linker parameter from the address bar on mount. */
export function useRemoveGoogleLinkerParam() {
  useEffect(() => {
    const cleanUrl = urlWithoutGoogleLinkerParam(new URL(window.location.href));

    if (!cleanUrl) {
      return;
    }

    // `null` state lets the Next.js app router copy its own state over and keep `useSearchParams` in sync.
    window.history.replaceState(null, '', cleanUrl);
  }, []);
}
