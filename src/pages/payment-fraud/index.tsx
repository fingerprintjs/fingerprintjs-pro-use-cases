import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Button from '../../client/components/common/Button';

import styles from './paymentFraud.module.scss';
import Alert from '../../client/components/common/Alert/Alert';

export default function Index() {
  const visitorDataQuery = useVisitorData({
    // Don't fetch visitorData on mount
    enabled: false,
  });

  // Default mocked card data
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardExpiration, setCardExpiration] = useState('04/28');

  const [orderStatusMessage, setOrderStatusMessage] = useState();
  const [applyChargeback, setApplyChargeback] = useState(false);
  const [usingStolenCard, setUsingStolenCard] = useState(false);
  const [severity, setSeverity] = useState();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState<number | undefined>();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const fpQuery = await visitorDataQuery.refetch();
    const { requestId, visitorId } = fpQuery.data;

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
    <UseCaseWrapper useCase={USE_CASES.paymentFraud} contentSx={{ maxWidth: 'none' }}>
      <div className={styles.wrapper}>
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
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
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="applyChargeback"
                onChange={(event) => setApplyChargeback(event.target.checked)}
              />
              Ask for chargeback after purchase
            </label>

            <label className={styles.checkboxLabel}>
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

          {httpResponseStatus ? <Alert severity={severity}>{orderStatusMessage}</Alert> : null}
          <Button disabled={isWaitingForResponse} size="large" type="submit" className={styles.submitButton}>
            {isWaitingForResponse ? 'Hold on, doing magic...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
