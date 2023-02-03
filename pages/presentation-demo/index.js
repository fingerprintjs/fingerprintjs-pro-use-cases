import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useGetVisits } from '../../client/api/identification/useGetVisits';

function MetadataItem({ name, value, direction = 'column', textColor = 'textPrimary', textVariant = 'body1' }) {
  return (
    <Stack
      spacing={direction === 'column' ? 0 : 1}
      direction={direction}
      alignItems={direction === 'column' ? 'flex-start' : 'baseline'}
      justifyContent="center"
    >
      <Typography fontWeight="bold" variant="overline" color="textPrimary">
        {name}
      </Typography>
      <Typography gutterBottom={false} color={textColor} variant={textVariant}>
        {value}
      </Typography>
    </Stack>
  );
}

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

  return (
    <UseCaseWrapper
      sx={{
        '& .UsecaseWrapper_wrapper': {
          maxWidth: 1000,
        },
      }}
      title="Presentation demo"
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
      {visitorData.data && visits.data && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={['flex-start', 'center']}
          justifyContent="space-between"
          spacing={3}
        >
          <Stack direction="column" spacing={3}>
            <MetadataItem
              name="Your visitor ID"
              value={visitorData.data.visitorId}
              textVariant="h5"
              textColor="primary"
            />
            <MetadataItem
              textColor="textPrimary"
              name="Your visit summary"
              value={`You visited ${visits.data.visits.length} times`}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <MetadataItem name="Incognito" value={`${visits.data.incognitoSessionsCount} sessions`} />
            <MetadataItem name="IP Address" value={`${visits.data.ipAddresses} IPs`} />
            <MetadataItem name="Geolocation" value={`${visits.data.locations} locations`} />
          </Stack>
        </Stack>
      )}
    </UseCaseWrapper>
  );
}
