import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import { Alert, CircularProgress } from '@mui/material';
import { useGetVisits } from '../../client/api/identification/useGetVisits';
import { IdentificationCard } from '../../client/components/presentation-demo/identification-card';
import Link from 'next/link';

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

  return (
    <UseCaseWrapper
      sx={{
        '& .UsecaseWrapper_content': {
          boxShadow: 'none',
          padding: 0,
        },
        '& .UsecaseWrapper_wrapper': {
          maxWidth: 1000,
        },
      }}
      title="Presentation demo"
      listItems={[
        <>
          Click <Link href={linkedId ? `/presentation-demo/list?${linkedId}` : '/presentation-demo/list'}>here</Link> to
          see all identified users
        </>,
      ]}
      description={
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in urna sapien. Sed varius imperdiet risus,
          quis dapibus nisi gravida ut. Aenean placerat risus quam, dictum interdum ante tempor posuere. Curabitur
          mauris nisl, vulputate eget viverra quis, hendrerit nec dolor. Suspendisse quis metus faucibus, facilisis
          ligula ut, porta nulla. Nullam id vehicula eros. Proin in eleifend odio. Donec blandit sapien a nunc efficitur
          blandit. Mauris nec nulla commodo, iaculis tortor eget, mollis ligula. Phasellus luctus vitae diam et
          vestibulum. Quisque nec fringilla erat. Nullam eu auctor diam. Aenean ultrices commodo tincidunt. Donec
          ultrices elit a elit faucibus, at sodales ipsum bibendum.
        </>
      }
    >
      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">Failed to get visitor data: {error.message}</Alert>}
      {visitorData.data && visits.data && (
        <IdentificationCard variant="extended" visitorId={visitorData.data.visitorId} visits={visits.data} />
      )}
    </UseCaseWrapper>
  );
}
