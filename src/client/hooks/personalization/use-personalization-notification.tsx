import { useCallback } from 'react';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useCopyToClipboard } from 'react-use';
import Button from '../../components/common/Button/Button';
import { CloseSnackbarButton } from '../../components/common/Alert/Alert';

export function usePersonalizationNotification() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [, copyToClipboard] = useCopyToClipboard();

  const showLinkCopiedSnackbar = useCallback(
    (prevSnackbarId: SnackbarKey) => {
      closeSnackbar(prevSnackbarId);

      enqueueSnackbar('Link copied! You can now open it in incognito mode.', {
        variant: 'success',
      });
    },
    [closeSnackbar, enqueueSnackbar],
  );

  const showNotification = useCallback(
    (message: string) => {
      enqueueSnackbar(`${message} It's also available in your incognito mode.`, {
        variant: 'success',
        action: (snackbarId) => (
          <>
            <Button
              variant='green'
              size='small'
              onClick={() => {
                copyToClipboard(window.location.href);
                showLinkCopiedSnackbar(snackbarId);
              }}
            >
              COPY LINK
            </Button>
            <CloseSnackbarButton snackbarId={snackbarId} />
          </>
        ),
      });
    },
    [copyToClipboard, enqueueSnackbar, showLinkCopiedSnackbar],
  );

  return {
    showNotification,
  };
}
