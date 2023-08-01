import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { ResetRequest, ResetResponse } from '../../../pages/api/admin/reset';
import { useSnackbar } from 'notistack';
import styles from './userReset.module.scss';

type UseResetParams = {
  onError?: () => void;
  onSuccess?: () => void;
};

export const useReset = ({ onError, onSuccess }: UseResetParams) => {
  const { getData } = useVisitorData({ ignoreCache: true });
  const { enqueueSnackbar } = useSnackbar();

  const resetMutation = useMutation<ResetResponse>(
    'resetMutation',
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
    {
      onError:
        onError ??
        ((error) => {
          enqueueSnackbar(`Reset failed: ${error}`, {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          });
        }),
      onSuccess:
        onSuccess ??
        ((data) => {
          enqueueSnackbar(
            <div>
              <p>Scenarios reset successfully!</p> <p>{data.message}</p>
            </div>,
            {
              variant: 'success',
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              autoHideDuration: 15000,
              className: styles.snackbar,
            }
          );
        }),
    }
  );

  return resetMutation;
};
