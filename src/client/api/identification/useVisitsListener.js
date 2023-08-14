import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { LIST_VISITS_QUERY } from './useListVisits';
import { useSocketEvent } from '../socket';

export function useVisitsListener(linkedId) {
  const queryClient = useQueryClient();

  const handleVisit = useCallback(
    (payload) => {
      if (payload.linkedId !== linkedId) {
        return;
      }

      const queryKey = [LIST_VISITS_QUERY, linkedId];

      queryClient.setQueryData(queryKey, (data) => {
        if (!data) {
          return data;
        }

        const existingEntryIndex = data.findIndex((entry) => entry.visitorId === payload.visitorId);

        if (existingEntryIndex > -1) {
          data[existingEntryIndex] = payload;
        } else {
          data.push(payload);
        }

        return data;
      });
    },
    [linkedId, queryClient],
  );

  useSocketEvent('visit', handleVisit);
}
