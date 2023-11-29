import { FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';

export function apiRequest(
  pathname: string,
  fpData: FingerprintJSPro.GetResult | undefined,
  body: Record<string, any> = {},
  abortSignal: AbortSignal | null = null,
) {
  return fetch(pathname, {
    method: 'POST',
    signal: abortSignal,
    body: JSON.stringify({
      requestId: fpData?.requestId,
      visitorId: fpData?.visitorId,
      ...body,
    }),
  }).then((res) => res.json());
}
