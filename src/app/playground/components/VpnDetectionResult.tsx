import { Event } from '@fingerprint/node-sdk';

export const vpnDetectionResult = ({ event }: { event: Event | undefined }): string => {
  // VPN detection in v7 is a top-level boolean with confidence and methods
  if (event?.vpn !== true) {
    return 'Not detected';
  }

  const methods = event.vpn_methods;
  const reasons = [
    methods?.public_vpn ? 'public VPN IP' : undefined,
    methods?.timezone_mismatch ? 'timezone mismatch' : undefined,
    methods?.os_mismatch ? 'OS mismatch' : undefined,
    methods?.relay ? 'relay service' : undefined,
    methods?.auxiliary_mobile ? 'mobile VPN' : undefined,
  ].filter(Boolean);

  const reasonsString = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';
  return `You are using a VPN 🌐 ${reasonsString}`;
};
