import { useQuery } from 'react-query';
import { useVisitorData } from '../use-visitor-data';
import { personalizationRequest } from './api';

function getSearchHistory(fpData) {
  return personalizationRequest('/api/personalization/get-search-history', fpData);
}

export const SEARCH_HISTORY_QUERY = 'SEARCH_HISTORY_QUERY';

export function useSearchHistory() {
  const { data: fpData } = useVisitorData();

  return useQuery(SEARCH_HISTORY_QUERY, () => getSearchHistory(fpData), {
    enabled: Boolean(fpData),
    initialData: {
      data: [],
      size: 0,
    },
  });
}
