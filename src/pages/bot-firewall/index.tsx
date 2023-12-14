import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { useMutation, useQuery } from 'react-query';
import { BotIp } from '../../server/botd-firewall/saveBotVisit';
import Button from '../../client/components/common/Button/Button';
import styles from './botFirewall.module.scss';

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

// const createFirewallRule = async (ipAddress: string) => {
//   await fetch('/api/bot-firewall/create-firewall-rule', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ipAddress }),
//   });
// };

const saveBlockedIp = async (ip: string) => {
  await fetch('/api/bot-firewall/block-bot-ip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ip }),
  });
};

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  const { data: botVisits, refetch } = useQuery({
    queryKey: ['ips'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-bot-visits').then((res) => res.json());
    },
  });

  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation<unknown, Error, string>({
    mutationFn: (ip: string) => saveBlockedIp(ip),
    onSuccess: () => {
      // refetch();
    },
  });

  if (!botVisits) {
    return null;
  }

  return (
    <>
      <UseCaseWrapper useCase={USE_CASES.botFirewall} embed={embed} contentSx={{ maxWidth: 'none' }}>
        <h2 className={styles.title}>Detected bot visits</h2>
        <Button size="small" outlined onClick={() => refetch()} className={styles.reloadButton}>
          Reload
        </Button>
        <table className={styles.ipsTable}>
          <thead>
            <th>Timestamp</th>
            <th>Request ID</th>
            <th>Visitor ID</th>
            <th>IP</th>
            <th>Bot Intention</th>
            <th>Bot Type</th>
            <th>Action</th>
          </thead>
          {botVisits?.map((botIp) => (
            <tr key={botIp?.requestId}>
              <td>{formatDate(botIp?.timestamp)}</td>
              <td>{botIp?.requestId}</td>
              <td>{botIp?.visitorId}</td>
              <td>{botIp?.ip}</td>
              <td>{botIp?.botResult}</td>
              <td>{botIp?.botType}</td>
              <td>
                <Button size="small" onClick={() => blockIp(botIp?.ip)} disabled={isLoadingBlockIp}>
                  Block this IP
                </Button>
              </td>
            </tr>
          ))}
        </table>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
