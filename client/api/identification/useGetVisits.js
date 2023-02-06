import { useQuery } from 'react-query';

export const GET_VISITS_QUERY = 'GET_VISITS_QUERY';

async function getVisits({ visitorId, linkedId }) {
  const url = new URL(`${location.origin}/api/identification/get-visits`);

  if (linkedId) {
    url.searchParams.set('linkedId', linkedId);
  }

  if (visitorId) {
    url.searchParams.set('visitorId', visitorId);
  }

  return fetch(url.toString())
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        throw new Error(data.message);
      }

      return data;
    });
}

export function useGetVisits({ visitorId = null, linkedId }) {
  return useQuery([GET_VISITS_QUERY, visitorId, linkedId], () => getVisits({ visitorId, linkedId }), {
    enabled: Boolean(visitorId),
  });
}
