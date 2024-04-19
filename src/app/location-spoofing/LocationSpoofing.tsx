'use client';

import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useState } from 'react';
import { USE_CASES } from '../../client/components/common/content';
import styles from './locationSpoofing.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import { Alert } from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button/Button';
import { Cart } from '../../client/components/common/Cart/Cart';
import { FingerprintJSPro, FpjsProvider, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { ActivateRegionalPricingPayload, ActivateRegionalPricingResponse } from './api/activate-ppp/route';
import { useUnsealedResult } from '../../client/hooks/useUnsealedResult';
import { getFlagEmoji, getIpLocation } from '../../shared/utils/locationUtils';
import { getRegionalDiscount } from './data/getDiscountByCountry';
import courseLogo from './fingerprintLogoLowOpacitySquareBordered.svg';
import { env } from '../../env';

const COURSE_PRICE = 100;
const TAXES = 15;
const FALLBACK_DISCOUNT = 20;

const LocationSpoofingUseCase: FunctionComponent = () => {
  const { getData: getVisitorData, data: visitorData } = useVisitorData({
    ignoreCache: true,
  });
  const { data: unsealedVisitorData } = useUnsealedResult(visitorData?.sealedResult);
  let country;
  let potentialDiscount;
  if (unsealedVisitorData) {
    country = getIpLocation(unsealedVisitorData)?.country;
    potentialDiscount = country?.code ? getRegionalDiscount(country.code) : FALLBACK_DISCOUNT;
  }

  const {
    mutate: activateRegionalPricing,
    isLoading,
    data: activateResponse,
    error: activateError,
  } = useMutation({
    mutationKey: ['activate regional pricing'],
    mutationFn: async () => {
      const { requestId, sealedResult } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/location-spoofing/api/activate-ppp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, sealedResult } satisfies ActivateRegionalPricingPayload),
      });
      return await response.json();
    },
    onSuccess: (data: ActivateRegionalPricingResponse) => {
      if (data.severity === 'success') {
        setDiscount(data.data.discount);
      } else {
        setDiscount(0);
      }
    },
  });

  const [courseCount, setCourseCount] = useState(1);
  const [discount, setDiscount] = useState(0);

  const cartItems = [
    {
      id: 0,
      name: 'Fight Online Fraud Course',
      subheadline: 'Fingerprint Inc.',
      price: COURSE_PRICE,
      image: courseLogo,
      count: courseCount,
      increaseCount: () => setCourseCount(courseCount + 1),
      decreaseCount: () => setCourseCount(Math.max(1, courseCount - 1)),
    },
  ];

  return (
    <div className={classNames(styles.wrapper, formStyles.wrapper)}>
      <Cart items={cartItems} discount={discount} taxPerItem={TAXES} discountLabel='Regional discount'></Cart>
      <div className={styles.innerWrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            activateRegionalPricing();
          }}
          className={classNames(formStyles.useCaseForm, styles.regionalPricingForm)}
        >
          <p>
            {unsealedVisitorData && (
              <>
                We noticed you are from {getFlagEmoji(getIpLocation(unsealedVisitorData)?.country?.code)}{' '}
                {getIpLocation(unsealedVisitorData)?.country?.name}! 👋{' '}
              </>
            )}
            We are offering purchasing power parity pricing.
          </p>
          {Boolean(activateError) && <Alert severity='error'>{String(activateError)}</Alert>}
          {activateResponse?.message && !isLoading && (
            <div>
              <Alert severity={activateResponse.severity}>{activateResponse.message}</Alert>
            </div>
          )}
          <div className={styles.regionaPricingContainer}>
            <Button disabled={isLoading} size='medium' data-testid={TEST_IDS.couponFraud.submitCoupon} type='submit'>
              {isLoading
                ? 'Verifying location...'
                : `Activate ${potentialDiscount ? potentialDiscount + '% off with ' : ''} regional pricing`}
            </Button>
          </div>
        </form>
      </div>
      <Button variant='white' type='button' size='small' disabled={true} className={styles.confirmOrderButton}>
        Confirm order
      </Button>
    </div>
  );
};

export const LocationSpoofingUseCaseWrapped: FunctionComponent = () => {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: env.NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY,
        scriptUrlPattern: [env.NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL, FingerprintJSPro.defaultScriptUrlPattern],
        endpoint: [env.NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT, FingerprintJSPro.defaultEndpoint],
      }}
    >
      <UseCaseWrapper useCase={USE_CASES.locationSpoofing}>
        <LocationSpoofingUseCase />
      </UseCaseWrapper>
    </FpjsProvider>
  );
};
