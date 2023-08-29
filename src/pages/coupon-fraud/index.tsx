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
const TAXES = 12;

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
};

const Shoe: FunctionComponent<ShoeProps> = ({ image, name, color, price, count }) => {
  return (
    <div className={styles.shoe}>
      <Image src={image} alt="shoe" width={92} height={92} />
      <div className={styles.shoeDescription}>
        <div className={styles.shoeName}>{name}</div>
        <div className={styles.shoeColor}>{color}</div>
        <div className={styles.priceAndCount}>
          <div className={styles.price}>{format$(price)}</div>
          <div className={styles.count}>
            <Image src={Minus} alt="Decrease item count" />
            <span>0{count}</span>
            <Image src={Plus} alt="Increase item count" />
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

  const subTotal = AIRMAX_PRICE + ALLSTAR_PRICE;
  const discountApplied = (subTotal * discount) / 100;
  const total = subTotal + TAXES - discountApplied;

  return (
    <UseCaseWrapper useCase={USE_CASES.couponFraud} embed={embed} contentSx={{ maxWidth: 'none' }}>
      <div className={classNames(styles.wrapper, formStyles.wrapper)}>
        <Shoe
          color="Fingerprint Orange"
          count={1}
          image={AirMax}
          name="Nike AirMax Max Size 8.5"
          price={AIRMAX_PRICE}
        ></Shoe>
        <Shoe
          color="Fingerprint Orange"
          count={1}
          image={AllStar}
          name="All Stars Limited Edition Size 6.5"
          price={ALLSTAR_PRICE}
        ></Shoe>
        <div className={styles.summary}>
          <div className={styles.item}>
            <span>Subtotal</span>
            <span>{format$(subTotal)}</span>
          </div>
          <div className={styles.item}>
            <span>Taxes</span>
            <span>{format$(TAXES)}</span>
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
        <Button disabled={true} type="button" className={styles.confirmOrderButton}>
          Confirm order
        </Button>
      </div>
    </UseCaseWrapper>
  );
}
