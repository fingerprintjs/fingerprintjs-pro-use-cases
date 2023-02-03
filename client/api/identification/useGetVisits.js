import { useQuery } from 'react-query';

export const GET_VISITS_QUERY = 'GET_VISITS_QUERY';

async function getVisits({ visitorId, linkedId }) {
  return fetch('/api/identification/get-visits', {
    method: 'POST',
    body: JSON.stringify({
      visitorId,
      linkedId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        throw new Error(data.message);
      }

      return data;
    });
}

export function useGetVisits({ visitorId = null, linkedId }) {
  return useQuery(GET_VISITS_QUERY, () => getVisits({ visitorId, linkedId }), {
    enabled: Boolean(visitorId),
  });
}
