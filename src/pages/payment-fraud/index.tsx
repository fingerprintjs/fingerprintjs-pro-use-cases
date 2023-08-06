import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import makeStyles from '@mui/styles/makeStyles';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import React from 'react';
import { Theme } from '@mui/material/styles/createTheme';

const useStyles = makeStyles<Theme>((theme) => ({
  margin: {
    'margin-top': theme.spacing(1),
    'margin-bottom': theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
}));

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

  const messageRef = useRef<HTMLDivElement>();

  useEffect(() => {
    !isWaitingForResponse && messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isWaitingForResponse]);

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
    <UseCaseWrapper
      title="Payment Fraud problem"
      description={<p>This page demonstrates protected credit card form protected against a variety types of fraud.</p>}
      articleURL="https://fingerprint.com/use-cases/payment-fraud/"
      listItems={[
        <>
          Only prefilled card details are correct. When you change them, the system will check if you tried to perform
          Card Cracking. After 3 unsuccessful attempts is this visitor flagged as suspicious and cannot place orders
          anymore.
        </>,
        <>
          If you have a positive chargeback history, can you place your order? Try to place a regular order after two
          chargebacks.
        </>,
        <>Simulate a visitor using a stolen card. Can you place another order from the same browser?</>,
        <>You can also try switching to the incognito mode or clearing cookies.</>,
      ]}
    >
      <form onSubmit={handleSubmit} className="Form_container">
        <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
          <Typography variant="caption" className="UserInput_label">
            Card Number
          </Typography>
          <TextField
            name="cardNumber"
            placeholder="Card Number"
            defaultValue={cardNumber}
            variant="outlined"
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </FormControl>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControl className={clsx(useStyles().margin)} variant="outlined" fullWidth>
              <Typography variant="caption" className="UserInput_label">
                Expiration
              </Typography>
              <TextField
                placeholder="Expiration"
                defaultValue={cardExpiration}
                variant="outlined"
                onChange={(e) => setCardExpiration(e.target.value)}
                required
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl className={clsx(useStyles().margin)} variant="outlined" fullWidth>
              <Typography variant="caption" className="UserInput_label">
                CVV
              </Typography>
              <OutlinedInput
                placeholder="CVV"
                defaultValue={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                required
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container justifyContent="flex-start">
          <FormControlLabel
            control={<Checkbox name="applyChargeback" color="primary" />}
            label="Ask for chargeback after purchase"
            onChange={(_event, checked) => setApplyChargeback(checked)}
          />
          <FormControlLabel
            control={<Checkbox name="usingStolenCard" color="primary" />}
            label="Flag this visitor using stolen card after purchase"
            onChange={(_event, checked) => {
              setUsingStolenCard(checked);
            }}
          />
        </Grid>
        <Button
          className="Form_button"
          disabled={isWaitingForResponse}
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          fullWidth
        >
          {isWaitingForResponse ? 'Hold on, doing magic...' : 'Place an order'}
        </Button>
      </form>
      {httpResponseStatus ? (
        <Alert ref={messageRef} severity={severity} className="UsecaseWrapper_alert">
          {orderStatusMessage}
        </Alert>
      ) : null}
    </UseCaseWrapper>
  );
}
