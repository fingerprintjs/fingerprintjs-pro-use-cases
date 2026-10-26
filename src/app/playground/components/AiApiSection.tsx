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

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

// `ai_crawler` -> `AI Crawler`
const formatBotCategory = (category: string) =>
  category
    .split('_')
    .map((word) => (word === 'ai' ? 'AI' : capitalize(word)))
    .join(' ');

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
        <p className={styles.aiApiDescription}>Detect AI agent network requests without browsers or JavaScript</p>
        {event ? (
          <div className={styles.aiApiColumns}>
            <div className={styles.aiApiSignals}>
              {/* Same fields and colors as the dashboard bot event page */}
              {bot ? (
                <div className={`${styles.aiApiBotCard} ${styles[bot.identity]}`}>
                  <div className={styles.aiApiBotCardTitle}>{capitalize(bot.identity)} bot identity</div>
                  <div className={styles.aiApiBotCardRow}>
                    <span>Category</span>
                    <span>{formatBotCategory(bot.category)}</span>
                  </div>
                  <div className={styles.aiApiBotCardRow}>
                    <span>Provider</span>
                    <span>
                      {bot.provider_url ? (
                        <a href={bot.provider_url} target='_blank' rel='noreferrer'>
                          {bot.provider}
                        </a>
                      ) : (
                        bot.provider
                      )}
                      {/* Spoofed bots only claim the name and provider */}
                      {bot.identity === 'spoofed' && (
                        <span className={styles.aiApiBotCardNote}>
                          This request claimed to be {bot.name} but its actual identity is unknown.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles.aiApiBotCardRow}>
                    <span>Name</span>
                    <span>{bot.name}</span>
                  </div>
                  <div className={styles.aiApiBotCardRow}>
                    <span>Confidence</span>
                    <span>{capitalize(bot.confidence)}</span>
                  </div>
                </div>
              ) : (
                <div className={`${styles.aiApiBotCard} ${styles.notDetected}`}>
                  <div className={styles.aiApiBotCardTitle}>Bot not detected</div>
                </div>
              )}
              <table className={tableStyles.signalTable}>
                <tbody>
                  <tr>
                    <td>IP address</td>
                    <td className={tableStyles.neutral}>{ip?.address ?? 'Unknown'}</td>
                  </tr>
                  {/* Do not show Map to bots, avoid needless MapBox API calls */}
                  {location?.latitude && location.longitude && !bot ? (
                    <tr>
                      <td>
                        Location
                        <div className={styles.locationText}>{getLocationName(location)}</div>
                      </td>
                      <td className={tableStyles.noPadding}>
                        <Map
                          position={[location.latitude, location.longitude]}
                          zoom={getZoomLevel(location.accuracy_radius)}
                          height='95px'
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td>Location</td>
                      <td className={tableStyles.neutral}>{getLocationName(location)}</td>
                    </tr>
                  )}
                  {detections.map(([label, value, detected]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className={detected ? tableStyles.red : tableStyles.green}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CollapsibleJsonViewer json={event} className={styles.aiApiJson} />
          </div>
        ) : (
          <p>Automation Intelligence API result unavailable: {'error' in result && result.error}</p>
        )}
      </div>
    </Container>
  );
}
