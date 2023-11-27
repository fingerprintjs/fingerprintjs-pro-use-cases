import { useCallback } from 'react';
import { SnackbarKey, useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import { useCopyToClipboard } from 'react-use';

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
              color="inherit"
              onClick={() => {
                copyToClipboard(window.location.href);

                showLinkCopiedSnackbar(snackbarId);
              }}
            >
              Copy link
            </Button>
            <Button color="inherit" onClick={() => closeSnackbar(snackbarId)}>
              Close
            </Button>
          </>
        ),
      });
    },
    [closeSnackbar, copyToClipboard, enqueueSnackbar, showLinkCopiedSnackbar],
  );

  return {
    showNotification,
  };
}
