import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Button from '../../client/components/common/Button/Button';

import styles from './paymentFraud.module.scss';
import formStyles from '../../styles/forms.module.scss';
import Alert from '../../client/components/common/Alert/Alert';
import { CustomPageProps } from '../_app';
import classNames from 'classnames';
import { Severity } from '../../server/checkResult';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';

export default function Index({ embed }: CustomPageProps) {
  const { getData } = useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );

  // Default mocked card data
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardExpiration, setCardExpiration] = useState('04/28');

  const [orderStatusMessage, setOrderStatusMessage] = useState();
  const [applyChargeback, setApplyChargeback] = useState(false);
  const [usingStolenCard, setUsingStolenCard] = useState(false);
  const [severity, setSeverity] = useState<Severity | undefined>();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState<number | undefined>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const fpData = await getData();
    const { requestId, visitorId } = fpData;

    const orderData = {
      cardNumber,
      cardCvv,
      cardExpiration,
      applyChargeback,
      usingStolenCard,
      visitorId,
      requestId,
    };

    // Server-side handler for this route is located in api/payment-fraud/place-order.js file.
    const response = await fetch('/api/payment-fraud/place-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseJson = await response.json();
    const responseStatus = response.status;
    setOrderStatusMessage(responseJson.message);
    setSeverity(responseJson.severity);
    setHttpResponseStatus(responseStatus);
    setIsWaitingForResponse(false);
  }

  return (
    <UseCaseWrapper useCase={USE_CASES.paymentFraud} contentSx={{ maxWidth: 'none' }} embed={embed}>
      <div className={formStyles.wrapper}>
        <form onSubmit={handleSubmit} className={classNames(formStyles.useCaseForm, styles.paymentForm)}>
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            defaultValue={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />

          <div className={styles.ccInfoGroup}>
            <div>
              <label>Expiration</label>
              <input
                type="text"
                placeholder="Expiration"
                defaultValue={cardExpiration}
                onChange={(e) => setCardExpiration(e.target.value)}
                required
              />
            </div>

            <div>
              <label>CVV</label>
              <input
                type="text"
                placeholder="CVV"
                defaultValue={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                required
              />
            </div>
          </div>

          <hr />

          <div className={styles.checkboxes}>
            <label className={formStyles.checkboxLabel}>
              <input
                type="checkbox"
                name="applyChargeback"
                onChange={(event) => setApplyChargeback(event.target.checked)}
              />
              Ask for chargeback after purchase
            </label>

            <label className={formStyles.checkboxLabel}>
              <input
                type="checkbox"
                name="usingStolenCard"
                onChange={(event) => {
                  setUsingStolenCard(event.target.checked);
                }}
              />
              Flag this visitor using stolen card after purchase
            </label>
          </div>

          {httpResponseStatus ? <Alert severity={severity ?? 'warning'}>{orderStatusMessage}</Alert> : null}
          <Button disabled={isWaitingForResponse} size="large" type="submit">
            {isWaitingForResponse ? 'Hold on, doing magic...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
