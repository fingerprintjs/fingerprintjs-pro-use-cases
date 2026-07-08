import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useEventsGetResponse } from './useEventsGetResponse';

global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useEventsGetResponse', () => {
  it('keeps the last successful event when a later refetch fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve({ id: 'X' }) } as Response)
      .mockRejectedValue(new TypeError('Failed to fetch'));

    const { result, rerender } = renderHook(({ eventId }) => useEventsGetResponse(eventId), {
      initialProps: { eventId: 'event-a' },
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual({ id: 'X' }));

    // A new event id whose request fails must not blank out the already-loaded data.
    rerender({ eventId: 'event-b' });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.data).toEqual({ id: 'X' });
  });
});
