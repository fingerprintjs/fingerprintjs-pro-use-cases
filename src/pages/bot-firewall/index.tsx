import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { useMutation, useQuery } from 'react-query';
import { BotIp } from '../../server/botd-firewall/saveBotVisit';
import Button from '../../client/components/common/Button/Button';
import styles from './botFirewall.module.scss';
import { BlockIpPayload, BlockIpResponse } from '../api/bot-firewall/block-bot-ip';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import classnames from 'classnames';
import { enqueueSnackbar } from 'notistack';

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-Us', {
    month: 'short',
    day: 'numeric',
  })} ${d.toLocaleTimeString('gb', { hour: '2-digit', minute: '2-digit' })}`;
};

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  // Get visitor data from Fingerprint (just used for the visitor's IP address)
  const { getData: getVisitorData, data: visitorData } = useVisitorData({
    ignoreCache: true,
    extendedResult: true,
  });

  // Get a list of bot visits
  const {
    data: botVisits,
    refetch: refetchBotVisits,
    isLoading: isLoadingBotVisits,
  } = useQuery({
    queryKey: ['botVisits'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-bot-visits').then((res) => res.json());
    },
  });

  // Get a list of currently blocked IP addresses
  const { data: blockedIps, refetch: refetchBlockedIps } = useQuery({
    queryKey: ['blockedIps'],
    queryFn: (): Promise<BotIp[]> => {
      return fetch('/api/bot-firewall/get-blocked-ips').then((res) => res.json());
    },
  });

  // Post request mutation to block/unblock IP addresses
  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation({
    mutationFn: async ({ ip, blocked }: Omit<BlockIpPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData();
      const response = await fetch('/api/bot-firewall/block-bot-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, blocked, requestId } satisfies BlockIpPayload),
      });
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to update firewall: ' + (await response.json()).message ?? response.statusText);
      }
    },
    onSuccess: async (data: BlockIpResponse) => {
      refetchBlockedIps();
      enqueueSnackbar(
        <>
          IP address <b>&nbsp;{data.ip}&nbsp;</b> was <b>&nbsp;{data.blocked ? 'blocked' : 'unblocked'}&nbsp;</b> in the
          application firewall.{' '}
        </>,
        { variant: 'success', autoHideDuration: 3000 },
      );
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error', autoHideDuration: 3000 });
    },
  });

  const isIpBlocked = (ip: string): boolean => {
    return Boolean(blockedIps?.find((blockedIp) => blockedIp?.ip === ip));
  };

  if (!isLoadingBotVisits && !botVisits) {
    return <h3>Failed to fetch bot visits.</h3>;
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
            disabled={isLoadingBotVisits}
          >
            {isLoadingBotVisits ? 'Loading bots visits ⏳' : 'Reload'}
          </Button>
          <i>Note: For the purposes of this demo, you can only block/unblock your own IP address ({visitorData?.ip})</i>
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
                        {isLoadingBlockIp
                          ? 'Working on it ⏳'
                          : isIpBlocked(botVisit?.ip)
                            ? 'Unblock'
                            : 'Block this IP'}
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
