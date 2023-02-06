import { useListVisits } from '../../../client/api/identification/useListVisits';
import { Box, CircularProgress, Stack } from '@mui/material';
import { IdentificationCard } from '../../../client/components/presentation-demo/identification-card';
import { UseCaseWrapper } from '../../../client/components/use-case-wrapper';
import { useVisitsListener } from '../../../client/api/identification/useVisitsListener';

export function getServerSideProps(ctx) {
  return {
    props: {
      linkedId: ctx.query.linkedId ?? null,
    },
  };
}

export default function Index({ linkedId }) {
  const allVisits = useListVisits({ linkedId });

  useVisitsListener(linkedId);

  return (
    <UseCaseWrapper
      returnUrl={linkedId ? `/presentation-demo?linkedId=${linkedId}` : '/presentation-demo'}
      sx={{
        '& .UsecaseWrapper_content': {
          boxShadow: 'none',
          padding: 0,
        },
        '& .UsecaseWrapper_wrapper': {
          maxWidth: 'initial',
        },
      }}
      hideSrcListItem
      title="Identified users"
      description="You can view all identified users here"
    >
      {allVisits.isLoading && <CircularProgress />}
      <Stack direction="row" flexWrap="wrap" spacing={2}>
        {Boolean(allVisits.data?.length) &&
          allVisits.data.map((visits) => (
            <Box minWidth={450} key={visits.visitorId}>
              <IdentificationCard variant="compact" visits={visits} visitorId={visits.visitorId} />
            </Box>
          ))}
      </Stack>
    </UseCaseWrapper>
  );
}
