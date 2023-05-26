import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/material';

export default function Playground() {
  const { data, isLoading, getData, error } = useVisitorData(
    { extendedResult: true, ignoreCache: true },
    { immediate: true }
  );

  const [eventData, setEventData] = useState<any>({});

  useEffect(() => {
    if (!data?.requestId) {
      return;
    }
    console.log('JS Agent response: ', data);

    fetch(`/api/event/${data.requestId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((eventData) => {
        console.log('Server API Event Response: ', eventData.products);
        setEventData(eventData);
      });
  }, [data]);

  return (
    <UseCaseWrapper
      title="Fingerprint Pro Playground"
      description={<p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>}
      showAdminLink={false}
      hideSrcListItem={true}
    >
      <div>
        <button onClick={() => getData({ ignoreCache: true })}>Analyze browser again</button>
        <p>VisitorId: {isLoading ? 'Loading...' : data?.visitorId}</p>
        <p>Full visitor data:</p>
        <Stack direction={'row'} spacing={2}>
          <pre>{error ? error.message : JSON.stringify(data, null, 2)}</pre>
          <pre>{JSON.stringify(eventData, null, 2)}</pre>
        </Stack>
      </div>
    </UseCaseWrapper>
  );
}
