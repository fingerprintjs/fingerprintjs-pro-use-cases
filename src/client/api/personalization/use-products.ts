import { useQuery, useQueryClient } from 'react-query';
import { SEARCH_HISTORY_QUERY } from './use-search-history';
import { apiRequest } from '../api';
import { GetProductResponse } from '../../../pages/api/personalization/get-products';
import { useVisitorData, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';

function getProducts(fpData: FingerprintJSPro.GetResult | undefined, query: string): Promise<GetProductResponse> {
  return apiRequest('/api/personalization/get-products', fpData, {
    query,
  });
}

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';

export function useProducts(search: string) {
  const { data: fpData } = useVisitorData();

  const queryClient = useQueryClient();

  return useQuery([GET_PRODUCTS_QUERY, search], () => getProducts(fpData, search), {
    enabled: Boolean(fpData),
    onSuccess: async () => {
      await queryClient.refetchQueries([SEARCH_HISTORY_QUERY]);
    },
  });
}
