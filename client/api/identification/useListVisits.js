import { useQuery } from 'react-query';

export const LIST_VISITS_QUERY = 'GET_VISITS_QUERY';

async function listVisits({ linkedId }) {
  const url = new URL(`${location.origin}/api/identification/list-visits`);

  if (linkedId) {
    url.searchParams.set('linkedId', linkedId);
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

export function useListVisits({ linkedId }) {
  return useQuery([LIST_VISITS_QUERY, linkedId], () => listVisits({ linkedId }));
}
