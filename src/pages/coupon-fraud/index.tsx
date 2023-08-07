import { useVisitorData } from '../../client/use-visitor-data';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useCallback, useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Image from 'next/image';
import { Stack, Typography } from '@mui/material';
import { useRequestCouponClaim } from '../../client/api/coupon-fraud/use-coupon-claim';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';

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
    [couponClaimMutation, couponCode, visitorDataQuery],
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
      description={<p>This page demonstrates how to solve the coupon fraud problem.</p>}
      articleURL={'https://fingerprint.com/use-cases/coupon-promo-abuse/'}
      listItems={[
        <>You can apply a coupon to the specific item only once.</>,
        <>You cannot spam coupon codes, there is a 1-hour threshold.</>,
        <>You cannot apply the same coupon in incognito mode.</>,
        <>
          Sample coupon codes are <code>Promo3000</code> and <code>BlackFriday</code>.
        </>,
      ]}
      moreResources={USE_CASES.couponFraud.moreResources}
    >
      <form onSubmit={handleSubmit}>
        <Typography fontSize={20}>iPhone 14 Pro Max 256 GB - Deep Purple</Typography>
        <Image width={256} height={200} style={{ objectFit: 'contain' }} src="/iphone14.png" alt="iPhone image" />
        <Typography fontWeight="bold" mb={2}>
          {new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(price)}
        </Typography>

        <Typography>Do you have a coupon? Apply to get a discount!</Typography>
        <Stack direction="row">
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
            <Alert severity={couponClaimMutation.data.severity} className="UsecaseWrapper_alert">
              {couponClaimMutation.data.message}
            </Alert>
          )}
        </div>
      </form>
    </UseCaseWrapper>
  );
}
