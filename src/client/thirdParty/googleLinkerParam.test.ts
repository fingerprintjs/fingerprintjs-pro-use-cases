import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { urlWithoutGoogleLinkerParam, useRemoveGoogleLinkerParam } from './googleLinkerParam';

/** A realistic (but made up) value of the linker parameter, as Google Analytics would produce it. */
// cspell:disable-next-line
const GL_VALUE = '1*1abc2de*_ga*MTIzNDU2Nzg5LjE3NTI2ODEyMzQ.*_ga_ABCDEF1234*czE3NTI2ODEyMzQkbzEkZzAkajYw';

const clean = (href: string) => urlWithoutGoogleLinkerParam(new URL(href));

describe('urlWithoutGoogleLinkerParam', () => {
  it('removes the linker parameter from the home page URL', () => {
    expect(clean(`https://demo.fingerprint.com/?_gl=${GL_VALUE}`)).toBe('/');
  });

  it('removes the linker parameter from a use case URL', () => {
    expect(clean(`https://demo.fingerprint.com/coupon-fraud?_gl=${GL_VALUE}`)).toBe('/coupon-fraud');
  });

  it('keeps the other query parameters and the hash', () => {
    expect(clean(`https://demo.fingerprint.com/playground?_gl=${GL_VALUE}&utm_source=blog#tab`)).toBe(
      '/playground?utm_source=blog#tab',
    );
  });

  it('returns undefined when there is nothing to remove', () => {
    expect(clean('https://demo.fingerprint.com/paywall?article=1')).toBeUndefined();
    expect(clean('https://demo.fingerprint.com/')).toBeUndefined();
  });

  it('does not confuse other parameters for the linker parameter', () => {
    expect(clean('https://demo.fingerprint.com/?_glossary=1')).toBeUndefined();
  });

  it('does not mutate the given URL', () => {
    const url = new URL(`https://demo.fingerprint.com/?_gl=${GL_VALUE}`);
    urlWithoutGoogleLinkerParam(url);
    expect(url.searchParams.has('_gl')).toBe(true);
  });
});

describe('useRemoveGoogleLinkerParam', () => {
  it('removes the parameter from the address bar on mount', () => {
    window.history.replaceState(null, '', `/paywall?_gl=${GL_VALUE}&utm_source=blog`);

    renderHook(() => useRemoveGoogleLinkerParam());

    expect(window.location.href).toBe(`${window.location.origin}/paywall?utm_source=blog`);
  });

  it('does not touch the URL when there is no parameter to remove', () => {
    window.history.replaceState(null, '', '/paywall?article=1');

    renderHook(() => useRemoveGoogleLinkerParam());

    expect(window.location.href).toBe(`${window.location.origin}/paywall?article=1`);
  });
});
