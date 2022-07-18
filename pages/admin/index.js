import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { getFingerprintJS } from '../../shared/client';
import { UseCaseWrapper } from '../../components/use-case-wrapper';

export default function Index() {
  const [statusMessage, setStatusMessage] = useState();
  const [severity, setSeverity] = useState();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
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
    setIsWaitingForResponse(true);

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
    setIsWaitingForResponse(false);
  }

  return (
    <UseCaseWrapper
      hideSrcListItem
      title="Administration"
      description=" On this page, you can remove all info obtained from this browser. This will reenable some scenarios for
              you if you were locked out from the specific action."
    >
      <form onSubmit={handleSubmit} className="Form_container">
        <Button
          disabled={isWaitingForResponse}
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          fullWidth
        >
          {isWaitingForResponse ? 'Working...' : 'Reset all data for this visitorId'}
        </Button>
      </form>
      {httpResponseStatus ? (
        <Alert
          severity={severity}
          className="UsecaseWrapper_alert"
          sx={{
            '&.UsecaseWrapper_alert': {
              marginBottom: 0,
            },
          }}
        >
          {statusMessage}
        </Alert>
      ) : null}
    </UseCaseWrapper>
  );
}
