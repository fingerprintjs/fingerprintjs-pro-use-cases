import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useState } from 'react';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import styles from './couponFraud.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import AirMax from './shoeAirMax.svg';
import AllStar from './shoeAllStar.svg';
import { Alert } from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button/Button';
import { Cart } from '../../client/components/common/Cart/Cart';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { CouponClaimPayload, CouponClaimResponse } from '../api/coupon-fraud/claim';

const AIRMAX_PRICE = 356.02;
const ALLSTAR_PRICE = 102.5;
const TAXES = 6;

export default function CouponFraudUseCase({ embed }: CustomPageProps) {
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
  const [allStarCount, setAllStarCount] = useState(1);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const cartItems = [
    {
      id: 0,
      name: 'Nike AirMax Max Size 8.5',
      subheadline: 'Fingerprint Orange',
      price: AIRMAX_PRICE,
      image: AirMax,
      count: airMaxCount,
      increaseCount: () => setAirMaxCount(airMaxCount + 1),
      decreaseCount: () => setAirMaxCount(Math.max(1, airMaxCount - 1)),
    },
    {
      id: 1,
      name: 'All Stars Limited Edition Size 6.5',
      subheadline: 'Fingerprint Orange',
      price: ALLSTAR_PRICE,
      image: AllStar,
      count: allStarCount,
      increaseCount: () => setAllStarCount(allStarCount + 1),
      decreaseCount: () => setAllStarCount(Math.max(1, allStarCount - 1)),
    },
  ];

  return (
    <UseCaseWrapper useCase={USE_CASES.couponFraud} embed={embed}>
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
    </UseCaseWrapper>
  );
}
