import { Event } from '@fingerprint/node-sdk';

export const proxyDetectionResult = ({ event }: { event: Event | undefined }): string => {
  if (event?.proxy !== true) {
    return 'Not detected';
  }

  const details = event.proxy_details;
  const extras = [
    event.proxy_confidence ? `confidence: ${event.proxy_confidence}` : undefined,
    event.proxy_ml_score != null ? `ML score: ${event.proxy_ml_score}` : undefined,
  ].filter(Boolean);
  const extrasText = extras.length > 0 ? ` (${extras.join(', ')})` : '';
  const providerText = details?.provider ? ` from ${details.provider}` : '';

  if (details?.proxy_type === 'residential' || details?.proxy_type === 'data_center') {
    return `Your IP is used by a ${details.proxy_type.replaceAll('_', ' ')} proxy${providerText} 🔄${extrasText}`;
  }

  return `Proxy detected 🔄${extrasText}`;
};
