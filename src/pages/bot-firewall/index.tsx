import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { useMutation, useQuery } from 'react-query';
import { BotIp } from '../../server/botd-firewall/saveBotVisit';
import Button from '../../client/components/common/Button/Button';
import styles from './botFirewall.module.scss';
import { BlockIpPayload } from '../api/bot-firewall/block-bot-ip';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import classnames from 'classnames';

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-Us', {
    month: 'short',
    day: 'numeric',
  })} ${d.toLocaleTimeString('gb', { hour: '2-digit', minute: '2-digit' })}`;
};

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  const { getData: getVisitorData, data: visitorData } = useVisitorData({
    ignoreCache: true,
    extendedResult: true,
  });

  const { data: botVisits, refetch: refetchBotVisits } = useQuery({
    queryKey: ['botVisits'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-bot-visits').then((res) => res.json());
    },
  });

  const { data: blockedIps, refetch: refetchBlockedIps } = useQuery({
    queryKey: ['blockedIps'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-blocked-ips').then((res) => res.json());
    },
  });

  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation({
    mutationFn: async ({ ip, blocked }: Omit<BlockIpPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData();
      return fetch('/api/bot-firewall/block-bot-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, blocked, requestId } satisfies BlockIpPayload),
      });
    },
    onSuccess: () => {
      refetchBlockedIps();
    },
  });

  const isIpBlocked = (ip: string): boolean => {
    return Boolean(blockedIps?.find((blockedIp) => blockedIp?.ip === ip));
  };

  if (!botVisits) {
    return null;
  }

  return (
    <>
      <UseCaseWrapper useCase={USE_CASES.botFirewall} embed={embed} contentSx={{ maxWidth: 'none' }}>
        <div className={styles.container}>
          <h2 className={styles.title}>Detected bot visits</h2>
          <Button
            size="small"
            outlined
            onClick={() => {
              refetchBotVisits();
              refetchBlockedIps();
            }}
            className={styles.reloadButton}
          >
            Reload
          </Button>
          <i>Note: For the purposes of this demo,you can only block/unblock your own IP address ({visitorData?.ip})</i>
          <table className={styles.ipsTable}>
            <thead>
              <th>Timestamp</th>
              <th>Request ID</th>
              <th>IP</th>
              <th>Bot Type</th>
              <th>Action</th>
            </thead>
            {botVisits?.map((botVisit) => {
              const isMyIp = botVisit?.ip === visitorData?.ip;
              return (
                <tr key={botVisit?.requestId} className={classnames(isMyIp && styles.mine)}>
                  <td>{formatDate(botVisit?.timestamp)}</td>
                  <td>{botVisit?.requestId}</td>
                  <td>{botVisit?.ip}</td>
                  <td>
                    {botVisit?.botResult} ({botVisit.botType})
                  </td>
                  <td>
                    {isMyIp ? (
                      <Button
                        size="small"
                        onClick={() => blockIp({ ip: botVisit?.ip, blocked: !isIpBlocked(botVisit?.ip) })}
                        disabled={isLoadingBlockIp}
                      >
                        {isIpBlocked(botVisit?.ip) ? 'Unblock' : 'Block this IP'}
                      </Button>
                    ) : (
                      <>-</>
                    )}
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
