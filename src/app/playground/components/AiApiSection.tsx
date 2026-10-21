import { CollapsibleJsonViewer } from '../../../client/components/CodeSnippet/CodeSnippet';
import Container from '../../../client/components/Container';
import { TEST_IDS } from '../../../client/testIDs';
import { getLocationName } from '../../../utils/locationUtils';
import type { AiApiResult } from '../../../server/automation-intelligence-api';
import styles from '../playground.module.scss';
import tableStyles from './SignalTable.module.scss';

/**
 * Shows the Automation Intelligence API (AI API) result for the page request.
 * The result is fetched on the server, so this is in the first HTML response, with or without JS.
 * Plain elements on purpose: SignalTable fades rows in with JS animation, which leaves them invisible without JS.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
export function AiApiSection({ result }: { result: AiApiResult }) {
  const event = 'event' in result ? result.event : undefined;
  const ip = event?.ip_info?.v4 ?? event?.ip_info?.v6;
  const bot = event?.bot_info;

  const rows = [
    [
      'Bot',
      bot
        ? `Detected: ${bot.name} (${bot.category}) by ${bot.provider}, identity ${bot.identity}, ${bot.confidence} confidence`
        : 'Not detected',
    ],
    ['IP address', ip?.address ?? 'Unknown'],
    ['Location', getLocationName(ip?.geolocation)],
    ['VPN detected', event?.vpn ? 'Detected' : 'Not detected'],
    ['Proxy detected', event?.proxy ? `Detected (${event.proxy_details?.proxy_type ?? 'unknown'})` : 'Not detected'],
    ['Data center IP', ip?.datacenter_result ? `Yes${ip.datacenter_name ? ` (${ip.datacenter_name})` : ''}` : 'No'],
  ];

  return (
    <Container size='large'>
      <div data-testid={TEST_IDS.playground.aiApiSection} className={styles.aiApiSection}>
        <h3 className={styles.tableTitle}>Automation Intelligence API</h3>
        {event ? (
          <div className={styles.aiApiColumns}>
            <table className={tableStyles.signalTable}>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className={tableStyles.neutral}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <CollapsibleJsonViewer json={event} />
          </div>
        ) : (
          <p>Automation Intelligence API result unavailable: {'error' in result && result.error}</p>
        )}
      </div>
    </Container>
  );
}
