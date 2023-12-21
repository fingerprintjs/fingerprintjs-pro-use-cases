import { describe, expect, it } from 'vitest';
import { chunk } from './utils';

describe('chunk', () => {
  it('should chunk an array into smaller arrays of the specified size', () => {
    expect(chunk(['a', 'b', 'c', 'd'], 2)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(chunk(['a', 'b', 'c', 'd'], 3)).toEqual([['a', 'b', 'c'], ['d']]);
  });

  it('should handle an empty array', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it('should handle a chunk size greater than the length of the array', () => {
    expect(chunk(['a', 'b', 'c'], 4)).toEqual([['a', 'b', 'c']]);
  });
});
