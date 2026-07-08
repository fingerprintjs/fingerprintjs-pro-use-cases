import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Event } from '@fingerprint/node-sdk';
import { useRef } from 'react';

export function useEventsGetResponse(eventId?: string) {
  const lastSuccessfulDataRef = useRef<Event | undefined>();

  const query = useQuery<Event | undefined>({
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

  if (query.isSuccess && query.data) {
    lastSuccessfulDataRef.current = query.data;
  }

  return {
    ...query,
    // Retain the last successful event when the id clears or a refetch fails, so
    // consumers keep showing results instead of blanking.
    data: query.data ?? lastSuccessfulDataRef.current,
  };
}
