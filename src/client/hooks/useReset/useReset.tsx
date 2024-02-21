import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { ResetRequest, ResetResponse } from '../../../pages/api/admin/reset';
import { useSnackbar } from 'notistack';
import styles from './userReset.module.scss';
import { useRouter } from 'next/router';
import { PLAYGROUND_METADATA, USE_CASES } from '../../components/common/content';
import { TEST_IDS } from '../../testIDs';

type UseResetParams = {
  onError?: () => void;
  onSuccess?: () => void;
};

export const useReset = ({ onError, onSuccess }: UseResetParams) => {
  const { getData } = useVisitorData({ ignoreCache: true });
  const { enqueueSnackbar } = useSnackbar();
  const { asPath } = useRouter();

  const resetMutation = useMutation<ResetResponse>(
    'resetMutation',
    async () => {
      const { requestId } = await getData();
      const body: ResetRequest = { requestId };

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
            <div data-testid={TEST_IDS.reset.resetSuccess}>
              <p>
                <b>Scenarios reset successfully!</b>
              </p>{' '}
              <ul>
                <li>Deleted {data.result?.deletedCouponsClaims} coupon claims.</li>
                <li>Deleted {data.result?.deletedLoginAttempts} login attempts.</li>
                <li>Deleted {data.result?.deletedLoanRequests} loan requests.</li>
                <li>Deleted {data.result?.deletedPaymentAttempts} payment attempts.</li>
                <li>Deleted {data.result?.deletedArticleViews} article views.</li>
                <li>Deleted {data.result?.deletedPersonalizationRecords} personalization records.</li>
                <li>Deleted {data.result?.deletedBlockedIps} blocked IPs.</li>
              </ul>
            </div>,
            {
              variant: 'success',
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              autoHideDuration: 6000,
              className: styles.snackbar,
            },
          );
        }),
    },
  );

  return {
    ...resetMutation,
    shouldDisplayResetButton:
      asPath !== '/' && !asPath.startsWith(PLAYGROUND_METADATA.url) && !asPath.startsWith(USE_CASES.webScraping.url),
  };
};
