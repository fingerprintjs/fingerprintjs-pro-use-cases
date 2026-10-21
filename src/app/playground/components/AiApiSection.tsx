import dynamic from 'next/dynamic';
import { CollapsibleJsonViewer } from '../../../client/components/CodeSnippet/CodeSnippet';
import Container from '../../../client/components/Container';
import { TEST_IDS } from '../../../client/testIDs';
import { getLocationName, getZoomLevel } from '../../../utils/locationUtils';
import type { AiApiResult } from '../../../server/automation-intelligence-api';
import styles from '../playground.module.scss';
import tableStyles from './SignalTable.module.scss';

// Map cannot be server-side rendered
const Map = dynamic(() => import('./Map'), { ssr: false });

/**
 * Shows the Automation Intelligence API (AI API) result for the page request.
 * The result is fetched on the server, so this is in the first HTML response, with or without JS.
 * Plain elements on purpose: SignalTable fades rows in with JS animation, which leaves them invisible without JS.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
export function AiApiSection({ result }: { result: AiApiResult }) {
  const event = 'event' in result ? result.event : undefined;
  const ip = event?.ip_info?.v4 ?? event?.ip_info?.v6;
  const location = ip?.geolocation;
  const bot = event?.bot_info;

  // Red when detected, green when not, like the Smart signals table
  const detections: [label: string, value: string, detected: boolean][] = [
    [
      'Bot',
      bot
        ? `Detected: ${bot.name} (${bot.category}) by ${bot.provider}, identity ${bot.identity}, ${bot.confidence} confidence`
        : 'Not detected',
      Boolean(bot),
    ],
    ['VPN detected', event?.vpn ? 'Detected' : 'Not detected', Boolean(event?.vpn)],
    [
      'Proxy detected',
      event?.proxy ? `Detected (${event.proxy_details?.proxy_type ?? 'unknown'})` : 'Not detected',
      Boolean(event?.proxy),
    ],
    [
      'Data center IP',
      ip?.datacenter_result ? `Yes${ip.datacenter_name ? ` (${ip.datacenter_name})` : ''}` : 'No',
      Boolean(ip?.datacenter_result),
    ],
  ];

  return (
    <Container size='large'>
      <div data-testid={TEST_IDS.playground.aiApiSection} className={styles.aiApiSection}>
        <h3 className={styles.tableTitle}>Automation Intelligence API</h3>
        {event ? (
          <div className={styles.aiApiColumns}>
            <table className={tableStyles.signalTable}>
              <tbody>
                <tr>
                  <td>IP address</td>
                  <td className={tableStyles.neutral}>{ip?.address ?? 'Unknown'}</td>
                </tr>
                <tr>
                  <td>
                    Location
                    <div className={styles.locationText}>{getLocationName(location)}</div>
                  </td>
                  <td className={tableStyles.noPadding}>
                    {/* Do not show Map to bots, avoid needless MapBox API calls */}
                    {location?.latitude && location.longitude && !bot && (
                      <Map
                        position={[location.latitude, location.longitude]}
                        zoom={getZoomLevel(location.accuracy_radius)}
                        height='95px'
                      />
                    )}
                  </td>
                </tr>
                {detections.map(([label, value, detected]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className={detected ? tableStyles.red : tableStyles.green}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <CollapsibleJsonViewer json={event} className={styles.aiApiJson} />
          </div>
        ) : (
          <p>Automation Intelligence API result unavailable: {'error' in result && result.error}</p>
        )}
      </div>
    </Container>
  );
}
