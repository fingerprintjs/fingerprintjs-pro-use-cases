import { useState, useEffect } from 'react';
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
  const [cardNumber, setCardNumber] = useState();
  const [cardCvv, setCardCvv] = useState();
  const [cardExpiration, setCardExpiration] = useState();
  const [orderStatusMessage, setOrderStatusMessage] = useState();
  const [applyChargeback, setApplyChargeback] = useState(false);
  const [severity, setSeverity] = useState();
  const [isWaitingForReponse, setIsWaitingForReponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState();
  const [fp, setFp] = useState();

  useEffect(() => {
    async function getFingerprint() {
      await getFingerprintJS(setFp);
    }
    getFingerprint();
  }, []);

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
      visitorId,
      requestId,
    };

    // Serverside handler for this route is located in api/authneticate.js file.
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
                If you have a positive chargeback history, can you place your order? Try to place a regular order after
                two chargebacks. You can also try switching to the incognito mode or clearing cookies.
              </li>
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
                    value="4242 4242 4242 4242"
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
                        value="04/28"
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
                        value="123"
                        variant="outlined"
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <FormControlLabel
                  className={clsx(useStyles().margin)}
                  control={<Checkbox color="primary" />}
                  label="Ask for chargeback"
                  onChange={(e) => setApplyChargeback(e.target.checked)}
                />
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
              <Alert severity={severity} className="UsecaseWrapper_alert">
                {orderStatusMessage}
              </Alert>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
