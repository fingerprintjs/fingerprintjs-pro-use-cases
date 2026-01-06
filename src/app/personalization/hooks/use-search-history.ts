import { useQuery } from '@tanstack/react-query';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { SearchHistoryPayload, SearchHistoryResponse } from '../api/get-search-history/route';

export const SEARCH_HISTORY_QUERY = 'SEARCH_HISTORY_QUERY';

export function useSearchHistory() {
  const { data: visitorData } = useVisitorData();
  return useQuery<SearchHistoryResponse>({
    queryKey: [SEARCH_HISTORY_QUERY],
    queryFn: async () => {
      if (!visitorData?.visitor_id) {
        throw new Error('Visitor data is undefined');
      }
      const { visitor_id: requestId } = visitorData;
      const response = await fetch('/personalization/api/get-search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId } satisfies SearchHistoryPayload),
      });
      return await response.json();
    },
    enabled: Boolean(visitorData),
    initialData: {
      severity: 'success',
      data: [],
      size: 0,
    },
  });
}
