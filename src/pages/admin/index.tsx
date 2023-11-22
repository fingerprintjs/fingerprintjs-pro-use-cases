import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import { Severity } from '../../server/checkResult';

export default function Index() {
  const [statusMessage, setStatusMessage] = useState<string>();
  const [severity, setSeverity] = useState<Severity>();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState<number | undefined>();

  const visitorData = useVisitorData({
    enabled: false,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const { data: fpResult } = await visitorData.refetch();
    const visitorId = fpResult?.visitorId;
    const requestId = fpResult?.requestId;

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
      hideGithubLink
      useCase={{
        title: 'Administration',
        description: (
          <p>
            On this page, you can remove all info obtained from this browser. This will reenable some scenarios for you
            if you were locked out of a specific action.
          </p>
        ),
        doNotMentionResetButton: true,
      }}
      contentSx={{
        minHeight: '40vh',
      }}
    >
      <form onSubmit={handleSubmit} className="Form_container">
        <Button
          id="reset"
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
