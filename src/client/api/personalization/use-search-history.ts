import { useQuery } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';

function getSearchHistory(fpData) {
  return apiRequest('/api/personalization/get-search-history', fpData);
}

export const SEARCH_HISTORY_QUERY = 'SEARCH_HISTORY_QUERY';

export type SearchTermData = {
  id: number;
  visitorId: string;
  query: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchHistoryResponse = {
  data: SearchTermData[];
  size: number;
};

export function useSearchHistory() {
  const { data: fpData } = useVisitorData();

  return useQuery<SearchHistoryResponse>(SEARCH_HISTORY_QUERY, () => getSearchHistory(fpData), {
    enabled: Boolean(fpData),
    initialData: {
      data: [],
      size: 0,
    },
  });
}
