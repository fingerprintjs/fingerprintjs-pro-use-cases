import { describe, expect, it } from 'vitest';
import { redactId } from './redactId';

describe('redactId', () => {
  it('replaces the last three characters', () => {
    expect(redactId('1772193689839.s9OOvM')).toBe('1772193689839.s9O***');
    expect(redactId('s2OaKGP53ef8105Hwgq3')).toBe('s2OaKGP53ef8105Hw***');
  });

  it('redacts the whole value when it is three characters or shorter', () => {
    expect(redactId('ab')).toBe('**');
    expect(redactId('abc')).toBe('***');
  });
});
