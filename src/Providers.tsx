'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';
import { CloseSnackbarButton, CustomSnackbar } from './client/components/common/Alert/Alert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider
        action={(snackbarId) => <CloseSnackbarButton snackbarId={snackbarId} />}
        maxSnack={4}
        autoHideDuration={5000}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        Components={{
          default: CustomSnackbar,
          success: CustomSnackbar,
          error: CustomSnackbar,
          warning: CustomSnackbar,
          info: CustomSnackbar,
        }}
      >
        {children}
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default Providers;
