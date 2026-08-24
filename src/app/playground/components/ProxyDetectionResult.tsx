import { Event } from '@fingerprint/node-sdk';

export const proxyDetectionResult = ({ event }: { event: Event | undefined }): string => {
  if (event?.proxy !== true) {
    return 'Not detected';
  }
  const details = event.proxy_details;
  const typeText = details?.proxy_type ? `${details.proxy_type.replace('_', ' ')} ` : '';
  const providerText = details?.provider ? ` from ${details.provider}` : '';
  const confidenceText = event.proxy_confidence ? ` (confidence: ${event.proxy_confidence})` : '';
  return `Your IP is used by a ${typeText}proxy provider${providerText} 🔄${confidenceText}`;
};
