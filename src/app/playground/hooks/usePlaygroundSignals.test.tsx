import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlaygroundSignals } from './usePlaygroundSignals';
import { useVisitorData } from '@fingerprint/react';
import { useEventsGetResponse } from '../../../client/hooks/useEventsGetResponse';
import { ReactNode } from 'react';

// Mock the useVisitorData hook
vi.mock('@fingerprint/react', () => ({
  useVisitorData: vi.fn(),
}));

vi.mock('../../../client/hooks/useEventsGetResponse', () => ({
  useEventsGetResponse: vi.fn(),
}));

const mockUseVisitorData = vi.mocked(useVisitorData);
const mockUseEventsGetResponse = vi.mocked(useEventsGetResponse);

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';

  return TestWrapper;
};

describe('usePlaygroundSignals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onServerApiSuccess callback *ONCE* every time Server API request succeeds', async () => {
    const mockEventId = 'test-event-id';
    const mockAgentResponse = { event_id: mockEventId };
    const mockServerResponse = {
      products: { identification: { data: { visitorId: 'test-visitor' } } },
    };
    const onServerApiSuccess = vi.fn();

    // Mock useVisitorData hook
    mockUseVisitorData.mockReturnValue({
      data: mockAgentResponse as any,
      isLoading: false,
      getData: vi.fn(),
      error: undefined,
      isFetched: true,
    });

    mockUseEventsGetResponse.mockReturnValue({
      data: mockServerResponse,
      isPending: false,
      isSuccess: true,
      error: null,
    } as ReturnType<typeof useEventsGetResponse>);

    const { rerender } = renderHook(() => usePlaygroundSignals({ onServerApiSuccess }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(onServerApiSuccess).toHaveBeenCalledWith(mockServerResponse);
    });

    // Rerendering the hook/component should not trigger the callback again
    rerender();

    // Verify callback was called exactly once
    expect(onServerApiSuccess).toHaveBeenCalledTimes(1);
  });

  // Option A: error presentation moved to the component (dismissible inline Alert),
  // so the hook no longer has onError. requestError is asserted via the component / e2e.
});
