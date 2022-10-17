import { apiRequest } from '../api';
import { useMutation } from 'react-query';

function claimCoupon({ fpData, body }) {
  return apiRequest('/api/coupon-fraud/claim', fpData, body);
}

export const REQUEST_COUPON_CLAIM_MUTATION = 'REQUEST_COUPON_CLAIM_MUTATION';

export function useRequestCouponClaim() {
  return useMutation(REQUEST_COUPON_CLAIM_MUTATION, ({ fpData, body }) => claimCoupon({ fpData, body }));
}
