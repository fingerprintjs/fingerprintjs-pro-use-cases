import { Card, Stack, Typography } from '@mui/material';

function KeyValue({ name, value, direction = 'column', textColor = 'textPrimary', textVariant = 'body1' }) {
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

function ExtendedCard({ visitorData, visits }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={['flex-start', 'center']}
      justifyContent="space-between"
      spacing={3}
    >
      <Stack direction="column" spacing={3}>
        <KeyValue name="Your visitor ID" value={visitorData.visitorId} textVariant="h5" textColor="primary" />
        <KeyValue
          textColor="textPrimary"
          name="Your visit summary"
          value={`You visited ${visits.visits.length} times`}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <KeyValue name="Incognito" value={`${visits.incognitoSessionsCount} sessions`} />
        <KeyValue name="IP Address" value={`${visits.ipAddresses} IPs`} />
        <KeyValue name="Geolocation" value={`${visits.locations} locations`} />
      </Stack>
    </Stack>
  );
}

function CompactCard({ visitorData, visits }) {
  return (
    <Stack direction="row" sx={{ width: '100%' }} justifyContent="space-between" alignItems="center">
      <Stack direction="column" spacing={2}>
        <KeyValue name="Visitor ID" value={visitorData.visitorId} textVariant="h5" textColor="primary" />
        <KeyValue textColor="textPrimary" name="Visit summary" value={`Visited ${visits.visits.length} times`} />
      </Stack>
      <Stack direction="column" spacing={2}>
        <KeyValue name="Incognito" value={`${visits.incognitoSessionsCount} sessions`} />
        <KeyValue name="IP Address" value={`${visits.ipAddresses} IPs`} />
      </Stack>
    </Stack>
  );
}

export function IdentificationCard({ visitorData, visits, variant = 'extended', ...cardProps }) {
  return (
    <Card
      {...cardProps}
      sx={{
        padding: (t) => t.spacing(4),
        ...cardProps?.sx,
      }}
    >
      {variant === 'extended' && <ExtendedCard visitorData={visitorData} visits={visits} />}
      {variant === 'compact' && <CompactCard visitorData={visitorData} visits={visits} />}
    </Card>
  );
}
