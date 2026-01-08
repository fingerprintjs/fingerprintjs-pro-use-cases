import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlaygroundSignals } from './usePlaygroundSignals';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { ReactNode } from 'react';

// Mock the useVisitorData hook
vi.mock('@fingerprintjs/fingerprintjs-pro-react', () => ({
  useVisitorData: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockUseVisitorData = vi.mocked(useVisitorData);
const mockFetch = vi.mocked(fetch);

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
    const mockRequestId = 'test-request-id';
    const mockAgentResponse = { event_id: mockRequestId };
    const mockServerResponse = {
      requestId: mockRequestId,
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

    // Mock fetch response
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve(mockServerResponse),
    } as Response);

    const { rerender } = renderHook(() => usePlaygroundSignals({ onServerApiSuccess }), {
      wrapper: createWrapper(),
    });

    // Wait for server API call to complete and callback to be called
    await waitFor(() => {
      expect(onServerApiSuccess).toHaveBeenCalledWith(mockServerResponse);
    });

    // Rerendering the hook/component should not trigger the callback again
    rerender();

    // Verify callback was called exactly once
    expect(onServerApiSuccess).toHaveBeenCalledTimes(1);
  });
});
