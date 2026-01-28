'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';
import { Fingerprint, FingerprintProvider } from '@fingerprint/react';
import { env } from '../env';
import { CloseSnackbarButton, CustomSnackbar } from '../client/components/Alert/Alert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function getFingerprintEndpoint(endpoint?: string) {
  if (typeof window === 'undefined' || !endpoint) {
    return undefined;
  }

  // In Agent V4, the endpoint must be a valid URL
  return new URL(endpoint, location.origin).toString();
}

export const FP_LOAD_OPTIONS: Fingerprint.StartOptions = {
  apiKey: env.NEXT_PUBLIC_API_KEY,
  //scriptUrlPattern: [env.NEXT_PUBLIC_SCRIPT_URL_PATTERN, FingerprintJSPro.defaultScriptUrlPattern],
  endpoints: getFingerprintEndpoint(env.NEXT_PUBLIC_ENDPOINT),
  region: env.NEXT_PUBLIC_REGION,
};

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
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
        <FingerprintProvider {...FP_LOAD_OPTIONS}>{children}</FingerprintProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default Providers;
