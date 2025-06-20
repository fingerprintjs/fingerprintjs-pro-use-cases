import { useRef } from 'react';
import { UseQueryResult } from '@tanstack/react-query';

export type WithPreviousDataResult<TData = unknown, TError = unknown> = UseQueryResult<TData, TError> & {
  /**
   * The data from the last *successful* query run, stays the same even while the query is refetching or has errored.
   */
  previousData: TData | undefined;
};

/**
 * Wrap a `useQuery` (or `useInfiniteQuery`) call to keep a stable
 * reference to the last successful `data` value.
 *
 * ```tsx
 * const { data, isLoading, previousData } = useWithPreviousData(
 *   useQuery({
 *     queryKey: ['todos'],
 *     queryFn: fetchTodos,
 *   }),
 * );
 * ```
 *
 * This is useful for displaying the previous data while the query is refetching (avoids UI flickering)
 */
export function useWithPreviousData<TData = unknown, TError = unknown>(
  queryResult: UseQueryResult<TData, TError>,
): WithPreviousDataResult<TData, TError> {
  // Persist the latest successful payload across renders.
  const previousDataRef = useRef<TData>();

  if (queryResult.isSuccess && queryResult.data !== undefined) {
    previousDataRef.current = queryResult.data;
  }

  return {
    ...queryResult,
    previousData: previousDataRef.current,
  } as WithPreviousDataResult<TData, TError>;
}
