import { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import { getFingerprintJS } from '../../shared/client';

export default function Index() {
  const [statusMessage, setStatusMessage] = useState();
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
      visitorId,
      requestId,
    };

    const response = await fetch('/api/admin/reset', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseJson = await response.json();
    const responseStatus = response.status;
    setStatusMessage(responseJson.message);
    setSeverity(responseJson.severity);
    setHttpResponseStatus(responseStatus);
    setIsWaitingForReponse(false);
  }

  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <h1 className="UsecaseWrapper_title">Administration </h1>
            <p className="UsecaseWrapper_helper">
              On this page, you can remove all info obtained from this browser. This will reenable some scenarios for
              you if you were locked out from the specific action.{' '}
            </p>
            <hr className="UsecaseWrapper_divider" />
            <Paper className="ActionWrapper_container">
              <form onSubmit={handleSubmit} className="Form_container">
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
                  {isWaitingForReponse ? 'Working...' : 'Reset all data for this visitorId'}
                </Button>
              </form>
            </Paper>
            {httpResponseStatus ? (
              <Alert severity={severity} className="UsecaseWrapper_alert">
                {statusMessage}
              </Alert>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
