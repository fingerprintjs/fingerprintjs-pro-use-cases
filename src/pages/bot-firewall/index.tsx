import { INSTRUCTION_ANCHOR_ID, UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
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
import { Tooltip } from '@mui/material';
import InfoIcon from '../../client/img/InfoIcon.svg';
import WaveIcon from '../../client/img/wave.svg';
import ChevronIcon from '../../client/img/chevronBlack.svg';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_DISPLAYED_VISITS = 10;
const DISPLAYED_VISITS_INCREMENT = 10;
const BOT_VISITS_FETCH_LIMIT = 200;

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
      return fetch(`/api/bot-firewall/get-bot-visits?limit=${BOT_VISITS_FETCH_LIMIT}`).then((res) => res.json());
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
        <div>
          IP address <b>&nbsp;{data.ip}&nbsp;</b> was <b>&nbsp;{data.blocked ? 'blocked' : 'unblocked'}&nbsp;</b> in the
          application firewall.{' '}
        </div>,
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

type BotVisitActionProps = {
  ip: string;
  isBlockedNow: boolean;
  isVisitorsIp: boolean;
  blockIp: (payload: Omit<BlockIpPayload, 'requestId'>) => void;
  isLoadingBlockIp: boolean;
};

const BotVisitAction: FunctionComponent<BotVisitActionProps> = ({
  ip,
  isBlockedNow,
  isVisitorsIp,
  blockIp,
  isLoadingBlockIp,
}) => {
  if (isVisitorsIp) {
    return (
      <Button
        onClick={() => blockIp({ ip, blocked: !isBlockedNow })}
        disabled={isLoadingBlockIp}
        size="medium"
        style={{ minWidth: '150px' }}
        variant={isBlockedNow ? 'danger' : 'green'}
      >
        {isLoadingBlockIp ? 'Working on it ⏳' : isBlockedNow ? BOT_FIREWALL_COPY.unblockIp : BOT_FIREWALL_COPY.blockIp}
      </Button>
    );
  }
  return (
    <Tooltip
      title={'You can only block your own IP in this demo, please see instructions above.'}
      enterTouchDelay={400}
      arrow
    >
      <div className={styles.notYourIpButton}>
        N/A <Image src={InfoIcon} alt="You can only block your own IP in this demo, please see instructions above." />
      </div>
    </Tooltip>
  );
};

const BotTypeInfo: FunctionComponent = () => (
  <Tooltip
    title={
      'Search engine crawlers and monitoring tools are registered as "good" bots, while headless browsers and automation tools are "bad".'
    }
    enterTouchDelay={400}
    arrow
  >
    <Image src={InfoIcon} alt="" />
  </Tooltip>
);

const InstructionPrompt: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div className={styles.instructionsPrompt}>
    <motion.div
      initial={{ rotate: 0 }}
      whileInView={{ rotate: [30, -30, 30, -30, 30, -30, 30, -30, 30, -30, 0] }}
      transition={{ duration: 1.5 }}
      viewport={{ once: true }}
    >
      <Image src={WaveIcon} alt="" />
    </motion.div>
    <motion.div
      // reveals content from left to right
      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' }}
      whileInView={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
    >
      {children}
    </motion.div>
  </div>
);

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

  const [displayedVisits, setDisplayedVisits] = useState(DEFAULT_DISPLAYED_VISITS);
  const isLoading = isLoadingVisitorData || isLoadingBotVisits || isLoadingBlockedIps;

  const isIpBlocked = (ip: string): boolean => {
    return Boolean(blockedIps?.find((blockedIp) => blockedIp === ip));
  };

  return (
    <>
      <UseCaseWrapper
        useCase={USE_CASES.botFirewall}
        embed={embed}
        contentSx={{ maxWidth: 'none' }}
        instructionsNote={`For the purposes of this demo, you can only block/unblock your own IP address (${visitorData?.ip}). The block expires after one hour. The database of bot visits is cleared on every website update.`}
      >
        <div className={styles.container}>
          <div className={styles.header}>
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
              {isLoading ? 'Loading ⏳' : 'Reload bot visits'}
            </Button>
            <InstructionPrompt>
              We recommend reading the <Link href={`#${INSTRUCTION_ANCHOR_ID}`}>instructions</Link> before trying the
              demo!
            </InstructionPrompt>
          </div>

          {/* Only displayed on large screens */}
          <table className={styles.botVisitsTable}>
            <thead>
              <tr>
                <th>
                  Timestamp <Image src={ChevronIcon} alt="" />
                </th>
                <th>Request ID</th>
                <th>
                  Bot Type <BotTypeInfo />
                </th>
                <th>IP Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {botVisits?.slice(0, displayedVisits).map((botVisit) => {
                return (
                  <tr key={botVisit?.requestId}>
                    <td>{formatDate(botVisit?.timestamp)}</td>
                    <td>{botVisit?.requestId}</td>
                    <td>
                      {botVisit?.botResult} ({botVisit.botType})
                    </td>
                    <td className={styles.wrapAndBreakTableCell}>{botVisit?.ip}</td>
                    <td>
                      <BotVisitAction
                        ip={botVisit?.ip}
                        isBlockedNow={isIpBlocked(botVisit?.ip)}
                        blockIp={blockIp}
                        isLoadingBlockIp={isLoadingBlockIp}
                        isVisitorsIp={botVisit?.ip === visitorData?.ip}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Only displated on small screens */}
          <div className={styles.cards}>
            {botVisits?.slice(0, displayedVisits).map((botVisit) => {
              return (
                <div key={botVisit.requestId} className={styles.card}>
                  <div className={styles.cardContent}>
                    <div>Timestamp</div>
                    <div>{formatDate(botVisit?.timestamp)}</div>

                    <div>Request ID</div>
                    <div>{botVisit?.requestId}</div>

                    <div>
                      Bot Type <BotTypeInfo />
                    </div>
                    <div>
                      {botVisit?.botResult} ({botVisit.botType})
                    </div>

                    <div>IP Address</div>
                    <div>{botVisit?.ip}</div>
                  </div>
                  <BotVisitAction
                    ip={botVisit?.ip}
                    isBlockedNow={isIpBlocked(botVisit?.ip)}
                    blockIp={blockIp}
                    isLoadingBlockIp={isLoadingBlockIp}
                    isVisitorsIp={botVisit?.ip === visitorData?.ip}
                  />
                </div>
              );
            })}
          </div>
          <Button
            size="medium"
            className={styles.loadMore}
            outlined
            onClick={() => setDisplayedVisits(displayedVisits + DISPLAYED_VISITS_INCREMENT)}
            disabled={!botVisits || displayedVisits >= botVisits.length}
          >
            Show older bot visits
          </Button>
        </div>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
