import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { useQuery } from 'react-query';
import { BotIp } from '../../server/botd-firewall/saveBotIp';
import Button from '../../client/components/common/Button/Button';
import styles from './botFirewall.module.scss';

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  const { data: botIps, refetch } = useQuery({
    queryKey: ['ips'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-ips').then((res) => res.json());
    },
  });

  if (!botIps) {
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
          {botIps?.map((botIp) => (
            <tr key={botIp?.requestId}>
              <td>{formatDate(botIp?.timestamp)}</td>
              <td>{botIp?.requestId}</td>
              <td>{botIp?.visitorId}</td>
              <td>{botIp?.ip}</td>
              <td>{botIp?.botResult}</td>
              <td>{botIp?.botType}</td>
              <td>
                <Button size="small">Block this IP</Button>
              </td>
            </tr>
          ))}
        </table>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
