import { Card, Stack, Typography } from '@mui/material';
import { DevicesChip } from './devices-chip';

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

function ExtendedCard({ visitorId, visits }) {
  return (
    <Stack direction="column" spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={['flex-start', 'center']}
        justifyContent="space-between"
        spacing={3}
      >
        <Stack direction="column" spacing={2}>
          <KeyValue name="Your visitor ID" value={visitorId} textVariant="h5" textColor="primary" />
          <KeyValue
            textColor="textPrimary"
            name="Your visit summary"
            value={`You visited ${visits.visits?.length ?? 0} times`}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <KeyValue name="Incognito" value={`${visits.incognitoSessionsCount} sessions`} />
          <KeyValue name="IP Address" value={`${visits.ipAddresses} IPs`} />
          <KeyValue name="Geolocation" value={`${visits.locations} locations`} />
        </Stack>
      </Stack>
      <DevicesChip visits={visits.visits} />
    </Stack>
  );
}

function CompactCard({ visitorId, visits }) {
  return (
    <Stack sx={{ width: '100%' }} direction="column" spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack direction="column" spacing={2}>
          <KeyValue name="Visitor ID" value={visitorId} textVariant="h5" textColor="primary" />
          <KeyValue textColor="textPrimary" name="Visit summary" value={`Visited ${visits.visits.length} times`} />
        </Stack>
        <Stack direction="column" spacing={2}>
          <KeyValue name="Incognito" value={`${visits.incognitoSessionsCount} sessions`} />
          <KeyValue name="IP Address" value={`${visits.ipAddresses} IPs`} />
        </Stack>
      </Stack>
      <DevicesChip visits={visits.visits} />
    </Stack>
  );
}

export function IdentificationCard({ visitorId, visits, variant = 'extended', ...cardProps }) {
  if (!visits) {
    return null;
  }

  console.log(visits);

  return (
    <Card
      {...cardProps}
      sx={{
        padding: (t) => t.spacing(4),
        ...cardProps?.sx,
      }}
    >
      {variant === 'extended' && <ExtendedCard visitorId={visitorId} visits={visits} />}
      {variant === 'compact' && <CompactCard visitorId={visitorId} visits={visits} />}
    </Card>
  );
}
