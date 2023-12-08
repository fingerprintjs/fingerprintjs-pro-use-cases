import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { FunctionComponent } from 'react';

const IpBlocklistResult: FunctionComponent<{ event: EventResponse | undefined }> = ({ event }) => {
  const blocklistData = event?.products?.ipBlocklist?.data;
  if (blocklistData?.result === false) {
    return <>Not detected</>;
  }
  if (blocklistData?.details?.attackSource && blocklistData?.details?.emailSpam) {
    return <>Your IP is on a blocklist 🚫 (it was part of multiple attacks)</>;
  }
  if (blocklistData?.details?.attackSource) {
    return <>Your IP is on a blocklist 🚫 (it was part of a network attack)</>;
  }
  if (blocklistData?.details?.emailSpam) {
    return <>Your IP is on a blocklist 🚫 (it was part of a spam attack)</>;
  }
  if (event?.products?.tor?.data?.result === true) {
    return <>Your IP is a Tor exit node 🧅</>;
  }
  if (event?.products?.proxy?.data?.result === true) {
    return <>Your IP is used by a public proxy provider 🔄</>;
  }
  return <>Unknown</>;
};

export default IpBlocklistResult;
