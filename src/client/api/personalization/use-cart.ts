import { apiRequest } from '../api';
import { useMutation, useQuery } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { useCallback } from 'react';
import { GetResult } from '@fingerprintjs/fingerprintjs-pro';
import { UserCartItem } from '../../../server/personalization/database';

function getCart(fpData) {
  return apiRequest('/api/personalization/cart/get-items', fpData);
}

function addCartItem(productId: number, fpData: GetResult) {
  return apiRequest('/api/personalization/cart/add-item', fpData, {
    productId,
  });
}

function removeCartItem(itemId: number, fpData: GetResult) {
  return apiRequest('/api/personalization/cart/remove-item', fpData, { itemId });
}

const GET_CART_QUERY = 'GET_CART_QUERY';
const ADD_CART_ITEM_MUTATION = 'ADD_CART_ITEM_MUTATION';
const REMOVE_CART_ITEM_MUTATION = 'REMOVE_CART_ITEM_MUTATION';

export function useCart() {
  const { data: visitorData } = useVisitorData();

  const cartQuery = useQuery<{ data: UserCartItem[]; size: number }>(GET_CART_QUERY, () => getCart(visitorData), {
    enabled: Boolean(visitorData),
  });
  const refetchCartOnSuccess = useCallback(
    async (data) => {
      if (data) {
        await cartQuery.refetch();
      }
    },
    [cartQuery],
  );

  const addCartItemMutation = useMutation<any, any, { productId: number }>(
    ADD_CART_ITEM_MUTATION,
    ({ productId }) => addCartItem(productId, visitorData),
    {
      onSuccess: refetchCartOnSuccess,
    },
  );
  const removeCartItemMutation = useMutation<any, any, { itemId: number }>(
    REMOVE_CART_ITEM_MUTATION,
    ({ itemId }) => removeCartItem(itemId, visitorData),
    {
      onSuccess: refetchCartOnSuccess,
    },
  );

  return {
    cartQuery,
    addCartItemMutation,
    removeCartItemMutation,
  };
}
