import { useVisitorData } from '../../client/use-visitor-data';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import { useRequestCouponClaim } from '../../client/api/coupon-fraud/use-coupon-claim';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import styles from './couponFraud.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import AirMax from './shoeAirMax.svg';
import AllStar from './shoeAllStar.svg';
import Plus from './buttonPlus.svg';
import Minus from './buttonMinus.svg';
import Alert from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button';

const AIRMAX_PRICE = 356.02;
const ALLSTAR_PRICE = 102.5;
const TAXES = 6;

const format$ = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

type ShoeProps = {
  name: string;
  color: string;
  price: number;
  image: any;
  count: number;
  increaseCount: () => void;
  decreaseCount: () => void;
};

const Shoe: FunctionComponent<ShoeProps> = ({ image, name, color, price, count, increaseCount, decreaseCount }) => {
  return (
    <div className={styles.shoe}>
      <Image src={image} alt="shoe" width={92} height={92} />
      <div className={styles.shoeDescription}>
        <div className={styles.shoeName}>{name}</div>
        <div className={styles.shoeColor}>{color}</div>
        <div className={styles.priceAndCount}>
          <div className={styles.price}>{format$(price)}</div>
          <div className={styles.count}>
            <Image src={Minus} alt="Decrease item count" onClick={decreaseCount} />
            <span>{String(count).padStart(2, '0')}</span>
            <Image src={Plus} alt="Increase item count" onClick={increaseCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CouponFraudUseCase({ embed }: CustomPageProps) {
  const visitorDataQuery = useVisitorData({
    // Don't fetch visitorData on mount
    enabled: false,
  });

  const couponClaimMutation = useRequestCouponClaim();

  const [airMaxCount, setAirMaxCount] = useState(1);
  const [allStarCount, setAllStarCount] = useState(1);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setIsWaitingForResponse(true);
      const fpData = await visitorDataQuery.refetch();

      await couponClaimMutation.mutateAsync({
        fpData: fpData.data,
        body: { couponCode },
      });

      setIsWaitingForResponse(false);
    },
    [couponClaimMutation, couponCode, visitorDataQuery],
  );

  useEffect(() => {
    if (couponClaimMutation?.data?.severity === 'success') {
      setDiscount(30);
    }
  }, [couponClaimMutation]);

  const subTotal = AIRMAX_PRICE * airMaxCount + ALLSTAR_PRICE * allStarCount;
  const discountApplied = (subTotal * discount) / 100;
  const taxesApplied = TAXES * (airMaxCount + allStarCount);
  const total = subTotal + taxesApplied - discountApplied;

  return (
    <UseCaseWrapper useCase={USE_CASES.couponFraud} embed={embed} contentSx={{ maxWidth: 'none' }}>
      <div className={classNames(styles.wrapper, formStyles.wrapper)}>
        <Shoe
          color="Fingerprint Orange"
          count={airMaxCount}
          image={AirMax}
          name="Nike AirMax Max Size 8.5"
          price={AIRMAX_PRICE}
          increaseCount={() => setAirMaxCount(airMaxCount + 1)}
          decreaseCount={() => setAirMaxCount(Math.max(1, airMaxCount - 1))}
        ></Shoe>
        <Shoe
          color="Fingerprint Orange"
          count={allStarCount}
          image={AllStar}
          name="All Stars Limited Edition Size 6.5"
          price={ALLSTAR_PRICE}
          increaseCount={() => setAllStarCount(allStarCount + 1)}
          decreaseCount={() => setAllStarCount(Math.max(1, allStarCount - 1))}
        ></Shoe>
        <div className={styles.summary}>
          <div className={styles.item}>
            <span>Subtotal</span>
            <span>{format$(subTotal)}</span>
          </div>
          <div className={styles.item}>
            <span>Taxes</span>
            <span>{format$(taxesApplied)}</span>
          </div>
          {discount > 0 && (
            <div className={classNames(styles.item, styles.discount)}>
              <span>Coupon Discount {discount}%</span>
              <span>-{format$(discountApplied)}</span>
            </div>
          )}
          <div className={styles.item}>
            <b>Total</b>
            <span>{format$(total)}</span>
          </div>
        </div>
        <div className={styles.innerWrapper}>
          <form onSubmit={handleSubmit} className={classNames(formStyles.useCaseForm, styles.couponFraudForm)}>
            <p>Do you have a coupon? Apply to get a discount!</p>
            <div className={styles.couponInputContainer}>
              <input
                type="text"
                id="coupon_code"
                placeholder="Enter a coupon"
                onChange={(e) => setCouponCode(e.target.value)}
                required
              />
              <Button disabled={isWaitingForResponse} type="submit" size="medium">
                {isWaitingForResponse ? 'Processing...' : 'Apply'}
              </Button>
            </div>
            {couponClaimMutation.data?.message && !couponClaimMutation.isLoading && (
              <div>
                <Alert severity={couponClaimMutation.data.severity}>{couponClaimMutation.data.message}</Alert>
              </div>
            )}
          </form>
        </div>
        <Button variant="white" type="button" size="small" disabled={true} className={styles.confirmOrderButton}>
          Confirm order
        </Button>
      </div>
    </UseCaseWrapper>
  );
}
