import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Playground } from './Playground';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';

// Mock the data hook so we can drive the error/data states directly.
vi.mock('./hooks/usePlaygroundSignals');

// Mock heavy presentational children that are irrelevant to the error handling under test.
vi.mock('./components/Map', () => ({ default: () => null }));
vi.mock('../../client/components/CodeSnippet/CodeSnippet', () => ({
  CollapsibleJsonViewer: () => <div data-testid='json-viewer' />,
}));
vi.mock('../LayoutUI', () => ({ LayoutUI: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
// next/image can't process the project's SVG imports under vitest; render a plain element instead.
// eslint-disable-next-line @next/next/no-img-element
vi.mock('next/image', () => ({ default: ({ alt }: { alt?: string }) => <img alt={alt ?? ''} /> }));

const mockUsePlaygroundSignals = vi.mocked(usePlaygroundSignals);

const VISITOR_ID = 'test-visitor-id-1234';
const ERROR_TEXT = /Server API Request TypeError: Failed to fetch/;

const baseReturn = {
  agentResponse: undefined,
  isLoadingAgentResponse: false,
  getAgentData: vi.fn(),
  agentError: undefined,
  identificationEvent: undefined,
  isPendingServerResponse: false,
  serverError: null,
} as unknown as ReturnType<typeof usePlaygroundSignals>;

const fakeEvent = {
  identification: { visitor_id: VISITOR_ID },
  browser_details: { browser_name: 'Chrome', browser_full_version: '1.0', os: 'macOS', os_version: '14' },
  ip_address: '1.1.1.1',
} as unknown as NonNullable<ReturnType<typeof usePlaygroundSignals>['identificationEvent']>;

describe('Playground request error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // vitest config does not enable `globals`, so Testing Library's auto-cleanup is not
  // registered — unmount explicitly so one test's DOM does not leak into the next.
  afterEach(() => {
    cleanup();
  });

  it('shows a full-page error when the request fails on the initial load (no result yet)', () => {
    mockUsePlaygroundSignals.mockReturnValue({
      ...baseReturn,
      serverError: new TypeError('Failed to fetch'),
    });

    render(<Playground />);

    expect(screen.getByText(ERROR_TEXT)).toBeTruthy();
    expect(screen.queryByText(VISITOR_ID)).toBeNull();
    // Full-page error is not dismissible (no close control).
    expect(screen.queryByText('x')).toBeNull();
  });

  it('shows a dismissible error alert while keeping the result UI when a later request fails', () => {
    mockUsePlaygroundSignals.mockReturnValue({
      ...baseReturn,
      identificationEvent: fakeEvent,
      serverError: new TypeError('Failed to fetch'),
    });

    render(<Playground />);

    // Result UI stays in place...
    expect(screen.getByText(VISITOR_ID)).toBeTruthy();
    // ...alongside a dismissible error alert.
    expect(screen.getByText(ERROR_TEXT)).toBeTruthy();

    // Dismissing the alert hides it but leaves the result UI intact.
    fireEvent.click(screen.getByText('x'));
    expect(screen.queryByText(ERROR_TEXT)).toBeNull();
    expect(screen.getByText(VISITOR_ID)).toBeTruthy();
  });
});
