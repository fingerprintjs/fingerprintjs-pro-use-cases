import { useQuery, useQueryClient } from 'react-query';
import { SEARCH_HISTORY_QUERY } from './use-search-history';
import { GetProductsResponse, GetProductsPayload } from '../../../app/personalization/api/get-products/route';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';

export function useProducts(query: string) {
  const { data: visitorData } = useVisitorData();

  const queryClient = useQueryClient();

  return useQuery<GetProductsResponse>({
    queryKey: GET_PRODUCTS_QUERY,
    queryFn: async () => {
      const { requestId } = visitorData!;
      const response = await fetch('/personalization/api/get-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, query } satisfies GetProductsPayload),
      });
      return await response.json();
    },
    enabled: Boolean(visitorData),
    onSuccess: async () => {
      await queryClient.refetchQueries([SEARCH_HISTORY_QUERY]);
    },
  });
}
