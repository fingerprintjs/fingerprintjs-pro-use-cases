'use client';

import { useEffect } from 'react';

/**
 * Google Analytics cross-domain measurement appends a `_gl` linker parameter to the URL when a visitor
 * follows a link from fingerprint.com to demo.fingerprint.com. The Google tag reads it once, on load, to
 * stitch the two sessions together. After that the parameter is just noise: the visitor sees it in the
 * address bar and carries it along into anything they copy, share or bookmark.
 * https://support.google.com/analytics/answer/10071811
 */
export const GOOGLE_LINKER_QUERY_PARAM = '_gl';

/**
 * Returns `href` without the Google linker parameter as a relative URL,
 * or `undefined` when the parameter is not present.
 */
export function urlWithoutGoogleLinkerParam(href: string): string | undefined {
  const url = new URL(href);

  if (!url.searchParams.has(GOOGLE_LINKER_QUERY_PARAM)) {
    return undefined;
  }

  url.searchParams.delete(GOOGLE_LINKER_QUERY_PARAM);

  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Removes the Google linker parameter from the address bar, but only once `isGoogleTagSettled` turns true.
 *
 * The parameter has to stay in the URL until the Google tag has had a chance to read it, removing it any
 * earlier would break the very cross-domain measurement it exists for. See `ThirdPartyIntegrations` for how
 * "settled" is decided.
 */
export function useRemoveGoogleLinkerParam(isGoogleTagSettled: boolean) {
  useEffect(() => {
    if (!isGoogleTagSettled) {
      return;
    }

    const cleanUrl = urlWithoutGoogleLinkerParam(window.location.href);

    if (!cleanUrl) {
      return;
    }

    /**
     * `replaceState` only rewrites the address bar: no navigation, no re-render, no extra history entry.
     * The state has to be `null` so that the Next.js app router copies its own internal state over and keeps
     * `usePathname`/`useSearchParams` in sync. Passing the current `history.state` would skip that.
     */
    window.history.replaceState(null, '', cleanUrl);
  }, [isGoogleTagSettled]);
}
