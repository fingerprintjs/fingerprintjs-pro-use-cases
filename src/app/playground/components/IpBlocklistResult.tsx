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
  // If we reach here, nothing was detected
  return 'Not detected';
};
