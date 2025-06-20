import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetProductsResponse, GetProductsPayload } from '../../../app/personalization/api/get-products/route';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { SEARCH_HISTORY_QUERY } from './use-search-history';
import { useEffect } from 'react';

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';

export function useProducts(search: string) {
  const { data: visitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  const queryClient = useQueryClient();

  const queryResult = useQuery<GetProductsResponse>({
    // Make a new request every time `query` changes
    queryKey: [GET_PRODUCTS_QUERY, search],
    queryFn: async () => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }
      const { requestId } = visitorData;
      const response = await fetch('/personalization/api/get-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, query: search } satisfies GetProductsPayload),
      });
      const result = (await response.json()) as GetProductsResponse;
      // If the query was saved, refetch the search history to show it in the "Last searches" UI
      if (result.data.querySaved) {
      }
      return result;
    },
    enabled: Boolean(visitorData),
  });

  // onSuccess effect handler
  const { data, isSuccess } = queryResult;
  useEffect(() => {
    if (isSuccess && data.data.querySaved) {
      queryClient.refetchQueries({ queryKey: [SEARCH_HISTORY_QUERY] });
    }
  }, [isSuccess, data, queryClient]);

  return queryResult;
}
