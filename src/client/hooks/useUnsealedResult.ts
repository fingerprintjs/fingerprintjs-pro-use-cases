import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { useQuery } from 'react-query';

export const useUnsealedResult = (sealedResult?: string) => {
  return useQuery<EventResponse>({
    queryKey: ['event', sealedResult],
    queryFn: async () => {
      return fetch('/api/decrypt', {
        method: 'POST',
        body: JSON.stringify({ sealedResult }),
      }).then((res) => res.json());
    },
    enabled: Boolean(sealedResult),
  });
};
