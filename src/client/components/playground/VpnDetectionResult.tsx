import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { FunctionComponent } from 'react';

const VpnDetectionResult: FunctionComponent<{ event: EventResponse | undefined }> = ({ event }) => {
  const VpnData = event?.products?.vpn?.data;
  if (!VpnData) {
    return <>Signal not available</>;
  }
  if (VpnData.result === false) {
    return <>Not detected</>;
  }
  const reasons = [
    VpnData.methods?.publicVPN ? 'public VPN IP' : undefined,
    VpnData.methods?.timezoneMismatch ? 'timezone mismatch' : undefined,
    // @ts-expect-error Remove when Node SDK includes new osMismatch property
    VpnData.methods?.osMismatch ? 'OS mismatch' : undefined,
  ].filter(Boolean);
  const reasonsString = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';
  return `You are using a VPN 🌐 ${reasonsString}`;
};

export default VpnDetectionResult;
