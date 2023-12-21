/**
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_chunk
 *
 * chunk(['a', 'b', 'c', 'd'], 2);
 * // => [['a', 'b'], ['c', 'd']]
 *
 *  chunk(['a', 'b', 'c', 'd'], 3);
 *  // => [['a', 'b', 'c'], ['d']]
 */
export const chunk = <T>(inputArray: T[], chunkSize: number): T[][] => {
  return inputArray.reduce((arr: T[][], item: T, idx: number) => {
    return idx % chunkSize === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};
