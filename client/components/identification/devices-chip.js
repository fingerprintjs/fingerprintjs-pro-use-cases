import { useMemo } from 'react';
import { Chip, Stack } from '@mui/material';

function getBrowserId({ browserDetails }) {
  return [browserDetails.browserName, browserDetails.browserFullVersion, browserDetails.os].join(',');
}

export function DevicesChip({ visits }) {
  const uniqueDevices = useMemo(() => {
    if (!visits?.length) {
      return [];
    }

    const visitsMap = new Map();

    visits.forEach((visit) => {
      const id = getBrowserId(visit);

      if (visitsMap.has(id)) {
        visitsMap.get(id).count++;
      } else {
        visitsMap.set(id, {
          id,
          count: 1,
          browserDetails: visit.browserDetails,
        });
      }
    });

    return Array.from(visitsMap.values());
  }, [visits]);

  return (
    <Stack direction="row" spacing={1}>
      {uniqueDevices.map((device) => (
        <Chip
          color="primary"
          key={device.id}
          label={`${device.browserDetails.browserName} (v${device.browserDetails.browserFullVersion}, ${device.browserDetails.os})`}
        />
      ))}
    </Stack>
  );
}
