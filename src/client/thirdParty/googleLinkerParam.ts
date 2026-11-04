'use client';

import { useEffect } from 'react';

/**
 * Removes the `_gl` Google Analytics cross-domain linker parameter that links from fingerprint.com carry.
 * Safe to drop on load: fingerprint.com and demo.fingerprint.com share the `_ga` cookies on `.fingerprint.com`,
 * so Google links the visitor without it. https://support.google.com/analytics/answer/10071811
 */
export function useRemoveGoogleLinkerParam() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('_gl')) {
      return;
    }
    url.searchParams.delete('_gl');
    // `null` state lets the Next.js app router copy its own state over and keep `useSearchParams` in sync.
    window.history.replaceState(null, '', url);
  }, []);
}
