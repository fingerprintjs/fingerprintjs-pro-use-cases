import { SnackbarKey, useSnackbar } from 'notistack';
import Button from '@mui/material/Button';

export function SnackbarAction({ snackbarId }: { snackbarId: SnackbarKey }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <Button onClick={() => closeSnackbar(snackbarId)} color='inherit'>
      Close
    </Button>
  );
}
