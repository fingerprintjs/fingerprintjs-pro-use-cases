import { useQuery } from 'react-query';
import { useVisitorData } from '../../../shared/client/useVisitorData';

function getSearchHistory(fpData) {
  return fetch('/api/personalization/get-search-history', {
    method: 'POST',
    body: JSON.stringify({
      requestId: fpData?.requestId,
      visitorId: fpData?.visitorId,
    }),
  }).then(async (res) => res.json());
}

export const SEARCH_HISTORY_QUERY = 'SEARCH_HISTORY_QUERY';

export function useSearchHistory() {
  const { data: fpData } = useVisitorData();

  return useQuery('SEARCH_HISTORY_QUERY', () => getSearchHistory(fpData), {
    enabled: Boolean(fpData),
    initialData: {
      data: [],
      size: 0,
    },
  });
}
