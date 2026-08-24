import { Event } from '@fingerprint/node-sdk';

export const proxyDetectionResult = ({ event }: { event: Event | undefined }): string => {
  if (event?.proxy !== true) {
    return 'Not detected';
  }

  const details = event.proxy_details;
  const proxyType = details?.proxy_type;
  // Docs also return "unknown" for ML-only detections (not in current SDK types).
  // https://dev.fingerprint.com/docs/smart-signals-reference#proxy-detection
  const typeLabel =
    proxyType === 'residential' || proxyType === 'data_center' ? proxyType.replaceAll('_', ' ') : undefined;
  const providerText = details?.provider ? ` from ${details.provider}` : '';
  const confidenceText = event.proxy_confidence ? ` (confidence: ${event.proxy_confidence})` : '';

  if (!typeLabel) {
    return `Proxy detected 🔄${confidenceText}`;
  }

  return `Your IP is used by a ${typeLabel} proxy${providerText} 🔄${confidenceText}`;
};
