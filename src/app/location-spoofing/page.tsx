'use client';

import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useState } from 'react';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import styles from '../../pages/coupon-fraud/couponFraud.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import AirMax from '../../pages/coupon-fraud/shoeAirMax.svg';
import { Alert } from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button/Button';
import { Cart } from '../../client/components/common/Cart/Cart';
import { FpjsProvider, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { CouponClaimPayload, CouponClaimResponse } from '../../pages/api/coupon-fraud/claim';
import { FP_LOAD_OPTIONS } from '../../pages/_app';

const COURSE_PRICE = 100;
const TAXES = 15;

function LocationSpoofingUseCase() {
  const { getData: getVisitorData } = useVisitorData(
    {
      ignoreCache: true,
    },
    { immediate: false },
  );

  const {
    mutate: claimCoupon,
    isLoading,
    data: claimResponse,
  } = useMutation({
    mutationKey: ['request coupon claim'],
    mutationFn: async ({ couponCode }: Omit<CouponClaimPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/api/coupon-fraud/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode, requestId } satisfies CouponClaimPayload),
      });
      return await response.json();
    },
    onSuccess: (data: CouponClaimResponse) => {
      if (data.severity === 'success') {
        setDiscount(30);
      }
    },
  });

  const [airMaxCount, setAirMaxCount] = useState(1);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const cartItems = [
    {
      id: 0,
      name: 'Fight Online Fraud Course',
      subheadline: 'Fingerprint Inc.',
      price: COURSE_PRICE,
      image: AirMax,
      count: airMaxCount,
      increaseCount: () => setAirMaxCount(airMaxCount + 1),
      decreaseCount: () => setAirMaxCount(Math.max(1, airMaxCount - 1)),
    },
  ];

  return (
    <div className={classNames(styles.wrapper, formStyles.wrapper)}>
      <Cart items={cartItems} discount={discount} taxPerItem={TAXES}></Cart>
      <div className={styles.innerWrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            claimCoupon({ couponCode });
          }}
          className={classNames(formStyles.useCaseForm, styles.couponFraudForm)}
        >
          <p>Do you have a coupon? Apply to get a discount!</p>
          <div className={styles.couponInputContainer}>
            <input
              type='text'
              placeholder='Enter a coupon'
              onChange={(e) => setCouponCode(e.target.value)}
              required
              data-testid={TEST_IDS.couponFraud.couponCode}
            />
            <Button disabled={isLoading} size='medium' data-testid={TEST_IDS.couponFraud.submitCoupon}>
              {isLoading ? 'Processing...' : 'Apply'}
            </Button>
          </div>
          {claimResponse?.message && !isLoading && (
            <div>
              <Alert severity={claimResponse.severity}>{claimResponse.message}</Alert>
            </div>
          )}
        </form>
      </div>
      <Button variant='white' type='button' size='small' disabled={true} className={styles.confirmOrderButton}>
        Confirm order
      </Button>
    </div>
  );
}

export default function Page() {
  return (
    <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
      <UseCaseWrapper useCase={USE_CASES.locationSpoofing}>
        <LocationSpoofingUseCase />
      </UseCaseWrapper>
    </FpjsProvider>
  );
}
