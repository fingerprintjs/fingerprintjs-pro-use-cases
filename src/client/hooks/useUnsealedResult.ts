import { Event } from '@fingerprint/node-sdk';
import { useQuery } from '@tanstack/react-query';

export const useUnsealedResult = (sealedResult?: string) => {
  return useQuery<Event>({
    queryKey: ['event', sealedResult],
    queryFn: async () => {
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        body: JSON.stringify({ sealedResult }),
      });
      if (response.status !== 200) {
        throw new Error('Failed to unseal result: ' + response.statusText);
      }
      return await response.json();
    },
    enabled: Boolean(sealedResult),
  });
};
