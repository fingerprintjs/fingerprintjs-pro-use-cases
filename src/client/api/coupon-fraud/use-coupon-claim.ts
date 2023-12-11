import { FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import { apiRequest } from '../api';
import { useMutation } from 'react-query';

function claimCoupon({ fpData, body }: CouponClaim) {
  return apiRequest('/api/coupon-fraud/claim', fpData, body);
}

type CouponClaim = {
  fpData: FingerprintJSPro.GetResult;
  body: {
    couponCode: string;
  };
};

export const REQUEST_COUPON_CLAIM_MUTATION = 'REQUEST_COUPON_CLAIM_MUTATION';

export function useRequestCouponClaim() {
  return useMutation<any, unknown, CouponClaim, unknown>(REQUEST_COUPON_CLAIM_MUTATION, ({ fpData, body }) =>
    claimCoupon({ fpData, body }),
  );
}
