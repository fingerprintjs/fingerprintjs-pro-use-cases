import { useQuery, useQueryClient } from  '@tanstack/react-query';
import { GetProductsResponse, GetProductsPayload } from '../../../app/personalization/api/get-products/route';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { SEARCH_HISTORY_QUERY } from './use-search-history';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';
export function useProducts(query: string) {
  const { data: visitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['GET_PRODUCTS_QUERY', query],
    queryFn: async ({ signal }) => {
      if (!visitorData) {
        throw new Error('Visitor data is undefined');
      }

      const { requestId } = visitorData;
      const response = await fetch('/personalization/api/get-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, query } satisfies GetProductsPayload),
        signal, // Added AbortSignal for request cancellation
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json() as Promise<GetProductsResponse>;
    },
    enabled: Boolean(visitorData),
    onSuccess: () => {
      // Using the new queryClient.invalidateQueries syntax
      queryClient.invalidateQueries({ 
        queryKey: ['SEARCH_HISTORY_QUERY'] 
      });
    },
    // Added additional v5 options
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });
}