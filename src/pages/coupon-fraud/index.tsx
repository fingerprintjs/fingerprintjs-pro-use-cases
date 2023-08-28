import { useVisitorData } from '../../client/use-visitor-data';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Image from 'next/image';
import { Stack } from '@mui/material';
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
  const [price, setPrice] = useState(1119);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const fpData = await visitorDataQuery.refetch();

      await couponClaimMutation.mutateAsync({
        fpData: fpData.data,
        body: { couponCode },
      });
    },
    [couponClaimMutation, couponCode, visitorDataQuery],
  );

  useEffect(() => {
    if (couponClaimMutation?.data?.severity === 'success') {
      setPrice(1000);
    }
  }, [couponClaimMutation]);

  const isLoading = visitorDataQuery.isLoading || couponClaimMutation.isLoading;

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
            <span>{format$(ALLSTAR_PRICE + AIRMAX_PRICE)}</span>
          </div>
          <div className={styles.item}>
            <span>Taxes</span>
            <span>{format$(TAXES)}</span>
          </div>
          <div className={styles.item}>
            <b>Total</b>
            <span>{format$(ALLSTAR_PRICE + AIRMAX_PRICE + TAXES)}</span>
          </div>
        </div>
        <div className={styles.innerWrapper}>
          <form onSubmit={handleSubmit}>
            <div>Do you have a coupon? Apply to get a discount!</div>
            <Stack direction="row" gap={'8px'}>
              <FormControl fullWidth variant="outlined" sx={{ minWidth: '70%' }}>
                <TextField
                  id="coupon_code"
                  placeholder="Enter a coupon"
                  variant="outlined"
                  defaultValue={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required
                />
              </FormControl>
              <Button
                className="Form_button"
                disabled={isLoading}
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                fullWidth
              >
                {isLoading ? 'Applying...' : 'Apply'}
              </Button>
            </Stack>
            <div>
              {couponClaimMutation.data?.message && !couponClaimMutation.isLoading && (
                <Alert severity={couponClaimMutation.data.severity}>{couponClaimMutation.data.message}</Alert>
              )}
            </div>
          </form>
        </div>
      </div>
    </UseCaseWrapper>
  );
}
