import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import { Alert, CircularProgress } from '@mui/material';
import { useGetVisits } from '../../client/api/identification/useGetVisits';
import { IdentificationCard } from '../../client/components/identification/identification-card';
import Link from 'next/link';
import { useGetVisitsListener } from '../../client/api/identification/useGetVisitsListener';

export function getServerSideProps(ctx) {
  return {
    props: {
      linkedId: ctx.query.linkedId ?? null,
    },
  };
}

export default function Index({ linkedId }) {
  const visitorData = useVisitorData({ linkedId });
  const visits = useGetVisits({
    visitorId: visitorData.data?.visitorId,
    linkedId,
  });

  const isLoading = visitorData.isLoading || visits.isLoading;
  const error = visitorData.error || visits.error;

  useGetVisitsListener({ visitorId: visitorData?.data?.visitorId, linkedId });

  return (
    <UseCaseWrapper
      contentSx={{
        maxWidth: 1000,
        boxShadow: 'none',
      }}
      useCase={{
        title: 'Presentation demo',
        instructions: [
          <>
            Click{' '}
            <Link href={linkedId ? `/presentation-demo/list?linkedId=${linkedId}` : '/presentation-demo/list'}>
              here
            </Link>{' '}
            to see all identified users
          </>,
        ],
      }}
    >
      {isLoading && <CircularProgress />}
      {/* @ts-expect-error */}
      {error && <Alert severity="error">Failed to get visitor data: {error.message}</Alert>}
      {visitorData.data && visits.data && (
        <IdentificationCard variant="extended" visitorId={visitorData.data.visitorId} visits={visits.data} />
      )}
    </UseCaseWrapper>
  );
}
