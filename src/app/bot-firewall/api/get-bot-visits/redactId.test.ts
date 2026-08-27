import { describe, expect, it } from 'vitest';
import { redactId } from './redactId';

describe('redactId', () => {
  it('replaces the last three characters', () => {
    expect(redactId('1772193689839.s9OOvM')).toBe('1772193689839.s9O***');
    expect(redactId('abcdefghijklmnopqrst')).toBe('abcdefghijklmnopq***');
  });

  it('redacts the whole value when it is three characters or shorter', () => {
    expect(redactId('ab')).toBe('**');
    expect(redactId('abc')).toBe('***');
  });
});
