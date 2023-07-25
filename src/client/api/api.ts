import { GetResult } from '@fingerprintjs/fingerprintjs-pro';

export function apiRequest(
  pathname: string,
  fpData: GetResult,
  body: Record<string, any> = {},
  abortSignal: AbortSignal = null
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
