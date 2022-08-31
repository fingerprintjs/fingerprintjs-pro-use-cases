export function apiRequest(pathname, fpData, body = {}) {
  return fetch(pathname, {
    method: 'POST',
    body: JSON.stringify({
      requestId: fpData?.requestId,
      visitorId: fpData?.visitorId,
      ...body,
    }),
  }).then((res) => res.json());
}
