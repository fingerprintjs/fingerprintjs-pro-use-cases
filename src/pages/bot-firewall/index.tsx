import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import { useMutation, useQuery } from 'react-query';
import { BotVisit } from '../../server/botd-firewall/botVisitDatabase';
import Button from '../../client/components/common/Button/Button';
import styles from './botFirewall.module.scss';
import { BlockIpPayload, BlockIpResponse } from '../api/bot-firewall/block-ip';
import { VisitorQueryContext, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { OptionsObject as SnackbarOptions, enqueueSnackbar } from 'notistack';
import { BOT_FIREWALL_COPY } from '../../client/bot-firewall/botFirewallCopy';

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-Us', {
    month: 'short',
    day: 'numeric',
  })} ${d.toLocaleTimeString('gb', { hour: '2-digit', minute: '2-digit' })}`;
};

const snackbarOptions: SnackbarOptions = {
  autoHideDuration: 3000,
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
};

const useBotVisits = () => {
  const {
    data: botVisits,
    refetch: refetchBotVisits,
    isLoading: isLoadingBotVisits,
  } = useQuery({
    queryKey: ['get bot visits'],
    queryFn: (): Promise<BotVisit[]> => {
      return fetch('/api/bot-firewall/get-bot-visits').then((res) => res.json());
    },
  });
  return { botVisits, refetchBotVisits, isLoadingBotVisits };
};

const useBlockedIps = () => {
  const {
    data: blockedIps,
    refetch: refetchBlockedIps,
    isLoading: isLoadingBlockedIps,
  } = useQuery({
    queryKey: ['get blocked IPs'],
    queryFn: (): Promise<string[]> => {
      return fetch('/api/bot-firewall/get-blocked-ips').then((res) => res.json());
    },
  });
  return { blockedIps, refetchBlockedIps, isLoadingBlockedIps };
};

const useBlockUnblockIpAddress = (
  getVisitorData: VisitorQueryContext<true>['getData'],
  refetchBlockedIps: () => void,
) => {
  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation({
    mutationKey: ['block IP'],
    mutationFn: async ({ ip, blocked }: Omit<BlockIpPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/api/bot-firewall/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, blocked, requestId } satisfies BlockIpPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to update firewall: ' + (await response.json()).message ?? response.statusText);
      }
      return await response.json();
    },
    onSuccess: async (data: BlockIpResponse) => {
      refetchBlockedIps();
      enqueueSnackbar(
        <>
          IP address <b>&nbsp;{data.ip}&nbsp;</b> was <b>&nbsp;{data.blocked ? 'blocked' : 'unblocked'}&nbsp;</b> in the
          application firewall.{' '}
        </>,
        { ...snackbarOptions, variant: 'success' },
      );
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, {
        ...snackbarOptions,
        variant: 'error',
      });
    },
  });

  return { blockIp, isLoadingBlockIp };
};

export const BotFirewall: NextPage<CustomPageProps> = ({ embed }) => {
  // Get visitor data from Fingerprint (just used for the visitor's IP address)
  const {
    getData: getVisitorData,
    data: visitorData,
    isLoading: isLoadingVisitorData,
  } = useVisitorData({
    extendedResult: true,
  });

  // Get a list of bot visits
  const { botVisits, refetchBotVisits, isLoadingBotVisits } = useBotVisits();

  // Get a list of currently blocked IP addresses
  const { blockedIps, refetchBlockedIps, isLoadingBlockedIps } = useBlockedIps();

  // Post request mutation to block/unblock IP addresses
  const { blockIp, isLoadingBlockIp } = useBlockUnblockIpAddress(getVisitorData, refetchBlockedIps);

  const isLoading = isLoadingVisitorData || isLoadingBotVisits || isLoadingBlockedIps;

  const isIpBlocked = (ip: string): boolean => {
    return Boolean(blockedIps?.find((blockedIp) => blockedIp === ip));
  };

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
            disabled={isLoading}
          >
            {isLoading ? 'Loading ⏳' : 'Reload'}
          </Button>
          <i>
            Note: For the purposes of this demo, you can only block/unblock your own IP address ({visitorData?.ip}). The
            block expires after one hour. The database of bot visits is cleared on every website update.
          </i>
          <table className={styles.ipsTable}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Request ID</th>
                <th>Bot Type</th>
                <th>IP</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {botVisits?.map((botVisit) => {
                const isMyIp = botVisit?.ip === visitorData?.ip;
                return (
                  <tr key={botVisit?.requestId}>
                    <td>{formatDate(botVisit?.timestamp)}</td>
                    <td>{botVisit?.requestId}</td>
                    <td>
                      {botVisit?.botResult} ({botVisit.botType})
                    </td>
                    <td>{botVisit?.ip}</td>
                    <td>
                      {isMyIp ? (
                        <button
                          onClick={() => blockIp({ ip: botVisit?.ip, blocked: !isIpBlocked(botVisit?.ip) })}
                          disabled={isLoadingBlockIp}
                          className={isIpBlocked(botVisit?.ip) ? styles.unblockIpButton : styles.blockIpButton}
                        >
                          {isLoadingBlockIp
                            ? 'Working on it ⏳'
                            : isIpBlocked(botVisit?.ip)
                              ? BOT_FIREWALL_COPY.unblockIp
                              : BOT_FIREWALL_COPY.blockIp}
                        </button>
                      ) : (
                        <button disabled={true} className={styles.notYourIpButton}>
                          N/A{' '}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
