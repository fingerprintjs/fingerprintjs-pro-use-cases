import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Event } from '@fingerprint/node-sdk';

export function useEventsGetResponse(eventId?: string) {
  return useQuery<Event | undefined>({
    queryKey: ['get-event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event/v4/${eventId}`, { method: 'POST' });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    enabled: Boolean(eventId),
    retry: false,
    placeholderData: keepPreviousData,
  });
}
