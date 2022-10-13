import { useVisitorData } from '../../client/use-visitor-data';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { useState, useEffect, useCallback } from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import styles from './coupon-fraud.module.css';
import Image from 'next/image';
import { Typography } from '@mui/material';
import { useRequestCouponClaim } from '../../client/api/coupon-fraud/use-coupon-claim';

export default function CouponFraudUseCase() {
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
    [couponClaimMutation, couponCode, visitorDataQuery]
  );

  useEffect(() => {
    if (couponClaimMutation?.data?.severity === 'success') {
      setPrice(1000);
    }
  }, [couponClaimMutation]);

  const isLoading = visitorDataQuery.isLoading || couponClaimMutation.isLoading;

  return (
    <UseCaseWrapper
      title="Coupon Fraud problem"
      description={<>This page demonstrates how to solve coupon fraud problem.</>}
      listItems={[
        <>You can apply a coupon to the specific item only once.</>,
        <>You can&apos;t apply same coupon more than once</>,
        <>You can&apos;t spam coupon codes, there is a 1 hour threshold</>,
        <>You can&apos;t apply the same coupon in incognito mode</>,
        <>
          Sample coupon codes are <code>123456</code> and <code>098765</code>
        </>,
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.checkoutContainer}>
          <div className={styles.productContainer}>
            <div className={styles.productItem}>
              <div className={styles.productInfo}>
                <Typography fontSize={20}>iPhone 14 Pro Max 256 GB - Deep Purple</Typography>
                <div className={styles.productImage}>
                  <Image width={256} height={256} src="/iphone14.png" alt="iPhone image" />
                </div>
              </div>
              <Typography fontWeight="bold">
                {new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(price)}
              </Typography>
            </div>
          </div>
          <div className={styles.couponContainer}>
            <Typography>Do you have a coupon? Apply to get discount!</Typography>
            <div className={styles.couponForm}>
              <FormControl fullWidth variant="outlined">
                <TextField
                  placeholder="123456"
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
            </div>
            <div>
              {couponClaimMutation.data?.message && !couponClaimMutation.isLoading && (
                <Alert severity={couponClaimMutation.data.severity} className="UsecaseWrapper_alert">
                  {couponClaimMutation.data.message}
                </Alert>
              )}
            </div>
          </div>
        </div>
      </form>
    </UseCaseWrapper>
  );
}
