import { Event } from '@fingerprint/node-sdk';

export const proxyDetectionResult = ({ event }: { event: Event | undefined }): string => {
  if (event?.proxy !== true) {
    return 'Not detected';
  }
  const proxyType = event.proxy_details?.proxy_type ?? 'unknown';
  return `Your IP is used by a ${proxyType} proxy provider 🔄`;
};
