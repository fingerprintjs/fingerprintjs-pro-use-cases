import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';

export default function Playground() {
  const { data, isLoading, getData, error } = useVisitorData(
    { extendedResult: true, ignoreCache: true },
    { immediate: true }
  );

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
        <pre>{error ? error.message : JSON.stringify(data, null, 2)}</pre>
      </div>
    </UseCaseWrapper>
  );
}
