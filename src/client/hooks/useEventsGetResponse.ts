import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { EventsGetResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export function useEventsGetResponse(requestId?: string) {
  return useQuery<EventsGetResponse | undefined>({
    queryKey: ['get-event', requestId],
    queryFn: async () => {
      const res = await fetch(`/api/event/${requestId}`, { method: 'POST' });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    enabled: Boolean(requestId),
    retry: false,
    placeholderData: keepPreviousData,
  });
}
