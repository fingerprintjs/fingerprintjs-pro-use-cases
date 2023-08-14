import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { useSocketEvent } from '../socket';

export const GET_VISITS_QUERY = 'GET_VISITS_QUERY';

export function useGetVisitsListener({ visitorId, linkedId = null }) {
  const queryClient = useQueryClient();

  const handleVisit = useCallback(
    (payload) => {
      if (payload.visitorId === visitorId && payload.linkedId === linkedId) {
        const queryKey = [GET_VISITS_QUERY, visitorId, linkedId];

        queryClient.setQueryData(queryKey, payload);
      }
    },
    [linkedId, queryClient, visitorId],
  );

  useSocketEvent('visit', handleVisit);
}
