import { CollapsibleJsonViewer } from '../../../client/components/CodeSnippet/CodeSnippet';
import Container from '../../../client/components/Container';
import { TEST_IDS } from '../../../client/testIDs';
import { getAiApiSummary } from '../../../utils/aiApiSummary';
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

  return (
    <Container size='large'>
      <div data-testid={TEST_IDS.playground.aiApiSection} className={styles.aiApiSection}>
        <h3 className={styles.tableTitle}>Automation Intelligence API</h3>
        {event ? (
          <div className={styles.aiApiColumns}>
            <table className={tableStyles.signalTable}>
              <tbody>
                {getAiApiSummary(event).map(([label, value]) => (
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
