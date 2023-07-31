import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { ResetRequest, ResetResponse } from '../../pages/api/admin/reset';

export const useReset = ({ onError, onSuccess }: { onError?: () => void; onSuccess?: () => void }) => {
  const { getData } = useVisitorData({ ignoreCache: true });

  const resetMutation = useMutation<ResetResponse>(
    async () => {
      const { visitorId, requestId } = await getData();
      const body: ResetRequest = { visitorId, requestId };

      return fetch('/api/admin/reset', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then((res) => res.json());
    },
    { onError, onSuccess }
  );

  return resetMutation;
};
