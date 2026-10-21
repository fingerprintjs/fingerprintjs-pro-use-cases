import type { Event } from '@fingerprint/node-sdk';
import { getLocationName } from './locationUtils';

/**
 * Readable label and value pairs for an Automation Intelligence API (AI API) event.
 * Shared by the Playground table and the text and HTML output of /api/automation-intelligence.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
export function getAiApiSummary(event: Event): [label: string, value: string][] {
  const ip = event.ip_info?.v4 ?? event.ip_info?.v6;
  const bot = event.bot_info;

  return [
    [
      'Bot',
      bot
        ? `Detected: ${bot.name} (${bot.category}) by ${bot.provider}, identity ${bot.identity}, ${bot.confidence} confidence`
        : 'Not detected',
    ],
    ['IP address', ip?.address ?? 'Unknown'],
    ['Location', getLocationName(ip?.geolocation)],
    ['VPN detected', event.vpn ? 'Detected' : 'Not detected'],
    ['Proxy detected', event.proxy ? `Detected (${event.proxy_details?.proxy_type ?? 'unknown'})` : 'Not detected'],
    ['Data center IP', ip?.datacenter_result ? `Yes${ip.datacenter_name ? ` (${ip.datacenter_name})` : ''}` : 'No'],
  ];
}
