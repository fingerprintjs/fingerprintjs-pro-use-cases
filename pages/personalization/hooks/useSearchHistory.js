import { useQuery } from 'react-query';

const getSearchHistory = (fpData) =>
  fetch('/api/personalization/get-search-history', {
    method: 'POST',
    body: JSON.stringify({
      requestId: fpData?.requestId,
      visitorId: fpData?.visitorId,
    }),
  }).then(async (res) => res.json());

export function useSearchHistory(fpData) {
  return useQuery('searchHistory', () => getSearchHistory(fpData), {
    enabled: Boolean(fpData),
    initialData: {
      data: [],
      size: 0,
    },
  });
}
