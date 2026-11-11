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
        const body: unknown = await response.json().catch(() => undefined);
        const reason =
          typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
            ? body.error
            : response.statusText;
        throw new Error('Failed to unseal result: ' + reason);
      }
      return await response.json();
    },
    enabled: Boolean(sealedResult),
  });
};
