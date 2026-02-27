import { Event } from '@fingerprint/node-sdk';

export const ipBlocklistResult = ({ event }: { event: Event | undefined }): string => {
  const blocklistData = event?.ip_blocklist;
  if (blocklistData?.attack_source && blocklistData.email_spam) {
    return 'Your IP is on a blocklist 🚫 (it was part of multiple attacks)';
  }
  if (blocklistData?.attack_source) {
    return 'Your IP is on a blocklist 🚫 (it was part of a network attack)';
  }
  if (blocklistData?.email_spam) {
    return 'Your IP is on a blocklist 🚫 (it was part of a spam attack)';
  }
  if (blocklistData?.tor_node === true) {
    return 'Your IP is a Tor exit node 🧅';
  }
  // Proxy detection in v7 - top level boolean property
  if (event?.proxy === true) {
    const proxyType = event.proxy_details?.proxy_type ?? 'unknown';
    return `Your IP is used by a ${proxyType} proxy provider 🔄`;
  }
  // If we reach here, nothing was detected
  return 'Not detected';
};
