import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { urlWithoutGoogleLinkerParam, useRemoveGoogleLinkerParam } from './googleLinkerParam';

/** A realistic (but made up) value of the linker parameter, as Google Analytics would produce it. */
// cspell:disable-next-line
const GL_VALUE = '1*1abc2de*_ga*MTIzNDU2Nzg5LjE3NTI2ODEyMzQ.*_ga_ABCDEF1234*czE3NTI2ODEyMzQkbzEkZzAkajYw';

describe('urlWithoutGoogleLinkerParam', () => {
  it('removes the linker parameter from the home page URL', () => {
    expect(urlWithoutGoogleLinkerParam(`https://demo.fingerprint.com/?_gl=${GL_VALUE}`)).toBe('/');
  });

  it('removes the linker parameter from a use case URL', () => {
    expect(urlWithoutGoogleLinkerParam(`https://demo.fingerprint.com/coupon-fraud?_gl=${GL_VALUE}`)).toBe(
      '/coupon-fraud',
    );
  });

  it('keeps the other query parameters and the hash', () => {
    expect(
      urlWithoutGoogleLinkerParam(`https://demo.fingerprint.com/playground?_gl=${GL_VALUE}&utm_source=blog#tab`),
    ).toBe('/playground?utm_source=blog#tab');
  });

  it('returns undefined when there is nothing to remove', () => {
    expect(urlWithoutGoogleLinkerParam('https://demo.fingerprint.com/paywall?article=1')).toBeUndefined();
    expect(urlWithoutGoogleLinkerParam('https://demo.fingerprint.com/')).toBeUndefined();
  });

  it('does not confuse other parameters for the linker parameter', () => {
    expect(urlWithoutGoogleLinkerParam('https://demo.fingerprint.com/?_glossary=1')).toBeUndefined();
  });
});

describe('useRemoveGoogleLinkerParam', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', `/?_gl=${GL_VALUE}`);
  });

  it('keeps the parameter while the Google tag has not settled yet, so the tag can still read it', () => {
    renderHook(() => useRemoveGoogleLinkerParam(false));

    expect(window.location.search).toContain('_gl=');
  });

  it('removes the parameter once the Google tag has settled', () => {
    const { rerender } = renderHook((isGoogleTagSettled: boolean) => useRemoveGoogleLinkerParam(isGoogleTagSettled), {
      initialProps: false,
    });
    expect(window.location.search).toContain('_gl=');

    rerender(true);

    expect(window.location.href).toBe(`${window.location.origin}/`);
  });

  it('does not touch the URL when there is no parameter to remove', () => {
    window.history.replaceState(null, '', '/paywall?article=1');

    renderHook(() => useRemoveGoogleLinkerParam(true));

    expect(window.location.href).toBe(`${window.location.origin}/paywall?article=1`);
  });
});
