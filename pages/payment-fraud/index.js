import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import { getFingerprintJS } from '../../shared/client';

const useStyles = makeStyles((theme) => ({
  margin: {
    'margin-top': theme.spacing(1),
    'margin-bottom': theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
}));

export default function Index() {
  // Default mocked card data
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardExpiration, setCardExpiration] = useState('04/28');

  const [orderStatusMessage, setOrderStatusMessage] = useState();
  const [applyChargeback, setApplyChargeback] = useState(false);
  const [usingStolenCard, setUsingStolenCard] = useState(false);
  const [severity, setSeverity] = useState();
  const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState();
  const [fp, setFp] = useState(null);

  const messageRef = useRef();

  useEffect(() => {
    async function getFingerprint() {
      await getFingerprintJS(setFp);
    }
    !fp && getFingerprint();
    !isWaitingForReponse && messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isWaitingForReponse, fp]);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsWaitingForReponse(true);

    const fpResult = await fp.get();
    const visitorId = fpResult.visitorId;
    const requestId = fpResult.requestId;

    const orderData = {
      cardNumber,
      cardCvv,
      cardExpiration,
      applyChargeback,
      usingStolenCard,
      visitorId,
      requestId,
    };

    // Serverside handler for this route is located in api/payment-fraud/place-order.js file.
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
    setIsWaitingForReponse(false);
  }

  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <h1 className="UsecaseWrapper_title">Payment Fraud problem</h1>
            <p className="UsecaseWrapper_helper">
              This page demonstrates protected credit card form protected against different fraud.
            </p>
            <hr className="UsecaseWrapper_divider" />
            <ul className="UsecaseWrapper_notes">
              <li>
                Only prefilled card details are correct. When you change them, the system will check if you tried to
                perform Card Cracking. After 3 unsuccessful attempts is this visitor flagged as suspicious and cannot
                place orders anymore.
              </li>
              <li>
                If you have a positive chargeback history, can you place your order? Try to place a regular order after
                two chargebacks.
              </li>
              <li>Simulate a visitor using a stolen card. Can you place another order from the same browser?</li>
              <li>You can also try switching to the incognito mode or clearing cookies.</li>
              <li>
                Need src?{' '}
                <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases" target="_blank" rel="noreferrer">
                  Sure!
                </a>
              </li>
            </ul>
            <Paper className="ActionWrapper_container">
              <form onSubmit={handleSubmit} className="Form_container">
                <FormControl fullWidth className={clsx(useStyles().margin)} variant="outlined">
                  <Typography variant="caption" className="UserInput_label">
                    Card Number
                  </Typography>
                  <TextField
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
                        variant="outlined"
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container justifyContent="flex-start">
                  <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="Ask for chargeback after purchase"
                    onChange={(e) => setApplyChargeback(e.target.checked)}
                  />
                  <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="Flag this visitor using stolen card after purchase"
                    onChange={(e) => setUsingStolenCard(e.target.checked)}
                  />
                </Grid>
                <Button
                  className="Form_button"
                  disabled={isWaitingForReponse}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                >
                  {isWaitingForReponse ? 'Hold on, doing magic...' : 'Place an order'}
                </Button>
              </form>
            </Paper>
            {httpResponseStatus ? (
              <Alert ref={messageRef} severity={severity} className="UsecaseWrapper_alert">
                {orderStatusMessage}
              </Alert>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
