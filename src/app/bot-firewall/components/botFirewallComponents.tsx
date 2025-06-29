import { motion } from 'framer-motion';
import { FunctionComponent, PropsWithChildren } from 'react';
import { BOT_FIREWALL_COPY } from './botFirewallCopy';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import WaveIcon from '../../../client/img/wave.svg';
import InfoIcon from '../../../client/img/InfoIconSvg.svg';
import styles from './botFirewallComponents.module.scss';
import { BlockIpPayload } from '../api/block-ip/route';
import Button from '../../../client/components/Button/Button';

type BotVisitActionProps = {
  ip: string;
  isBlockedNow: boolean;
  isVisitorsIp: boolean;
  blockIp: (payload: Omit<BlockIpPayload, 'requestId'>) => void;
  isPendingBlockIp: boolean;
};

export const BotVisitAction: FunctionComponent<BotVisitActionProps> = ({
  ip,
  isBlockedNow,
  isVisitorsIp,
  blockIp,
  isPendingBlockIp,
}) => {
  if (isVisitorsIp) {
    return (
      <Button
        onClick={() => blockIp({ ip, blocked: !isBlockedNow })}
        disabled={isPendingBlockIp}
        size='medium'
        style={{ minWidth: '150px' }}
        variant={isBlockedNow ? 'danger' : 'green'}
      >
        {isPendingBlockIp ? 'Working on it ⏳' : isBlockedNow ? BOT_FIREWALL_COPY.unblockIp : BOT_FIREWALL_COPY.blockIp}
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
        N/A <Image src={InfoIcon} alt='You can only block your own IP in this demo, please see instructions above.' />
      </div>
    </Tooltip>
  );
};

export const BotTypeInfo: FunctionComponent = () => (
  <Tooltip
    title={
      'Search engine crawlers and monitoring tools are registered as "good" bots, while headless browsers and automation tools are "bad".'
    }
    enterTouchDelay={400}
    arrow
  >
    <Image src={InfoIcon} alt='' />
  </Tooltip>
);

export const InstructionPrompt: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div className={styles.instructionsPrompt}>
    <motion.div
      initial={{ rotate: 0 }}
      whileInView={{ rotate: [30, -30, 30, -30, 30, -30, 30, -30, 30, -30, 0] }}
      transition={{ duration: 1.5 }}
      viewport={{ once: true }}
    >
      <Image src={WaveIcon} alt='' />
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
