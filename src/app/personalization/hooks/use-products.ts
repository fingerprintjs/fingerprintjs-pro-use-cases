import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetProductsResponse, GetProductsPayload } from '../../../app/personalization/api/get-products/route';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { SEARCH_HISTORY_QUERY } from './use-search-history';

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';

export function useProducts(query: string) {
  const { data: visitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  const queryClient = useQueryClient();
  const queryResult = useQuery<GetProductsResponse>({
    // Make a new request every time `query` changes
    queryKey: [GET_PRODUCTS_QUERY, query],
    queryFn: async () => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }
      const { requestId } = visitorData;
      const response = await fetch('/personalization/api/get-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, query } satisfies GetProductsPayload),
      });
      const result = (await response.json()) as GetProductsResponse;
      // If the query was saved, refetch the search history to show it in the "Last searches" UI
      if (result.data.querySaved) {
        queryClient.refetchQueries({ queryKey: [SEARCH_HISTORY_QUERY] });
      }
      return result;
    },
    enabled: Boolean(visitorData),
  });

  return queryResult;
}
