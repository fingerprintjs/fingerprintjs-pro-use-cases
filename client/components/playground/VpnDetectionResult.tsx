import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { FunctionComponent } from 'react';

const VpnDetectionResult: FunctionComponent<{ event: EventResponse | undefined }> = ({ event }) => {
  const VpnData = event?.products?.vpn?.data;
  if (VpnData?.result === false) {
    return <>Not detected</>;
  }
  if (VpnData?.methods?.publicVPN && VpnData?.methods?.timezoneMismatch) {
    return <>You are using a VPN 🌐 (timezone mismatch + known public VPN IP)</>;
  }
  if (VpnData?.methods?.publicVPN) {
    return <>You are using a VPN 🌐 (known public VPN IP)</>;
  }
  if (VpnData?.methods?.timezoneMismatch) {
    return <>You are using a VPN 🌐 (timezone mismatch)</>;
  }
  return <>Unknown</>;
};

export default VpnDetectionResult;
