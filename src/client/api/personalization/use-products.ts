import { useQuery, useQueryClient } from 'react-query';
import { SEARCH_HISTORY_QUERY } from './use-search-history';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';

function getProducts(fpData, query) {
  return apiRequest('/api/personalization/get-products', fpData, {
    query,
  });
}

export const GET_PRODUCTS_QUERY = 'GET_PRODUCTS_QUERY';

export function useProducts(search) {
  const { data: fpData } = useVisitorData();

  const queryClient = useQueryClient();

  return useQuery([GET_PRODUCTS_QUERY, search], () => getProducts(fpData, search), {
    enabled: Boolean(fpData),
    onSuccess: async () => {
      await queryClient.refetchQueries([SEARCH_HISTORY_QUERY]);
    },
  });
}
