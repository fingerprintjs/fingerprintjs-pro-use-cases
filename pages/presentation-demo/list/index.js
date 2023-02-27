import { useListVisits } from '../../../client/api/identification/useListVisits';
import { CircularProgress, Grid } from '@mui/material';
import { IdentificationCard } from '../../../client/components/identification/identification-card';
import { UseCaseWrapper } from '../../../client/components/use-case-wrapper';
import { useVisitsListener } from '../../../client/api/identification/useVisitsListener';
import React from 'react';

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
      description={<p>You can view all identified users here.</p>}
    >
      {allVisits.isLoading && <CircularProgress />}
      <Grid container spacing={2}>
        {Boolean(allVisits.data?.length) &&
          allVisits.data.map((visits) => (
            <Grid item xs={12} md={6} lg={4} key={visits.visitorId}>
              <IdentificationCard variant="compact" visits={visits} visitorId={visits.visitorId} />
            </Grid>
          ))}
      </Grid>
    </UseCaseWrapper>
  );
}
