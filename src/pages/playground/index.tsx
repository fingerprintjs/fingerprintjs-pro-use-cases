import { FunctionComponent, ReactNode, useMemo } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { green, red } from '@mui/material/colors';
import { lightGreen } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';
import dynamic from 'next/dynamic';
import MyTable, { TableCellData } from '../../client/components/playground/MyTable';
import BotDetectionResult from '../../client/components/playground/BotDetectionResult';
import Info from '../../client/components/playground/InfoIcon';
import RefreshButton from '../../client/components/playground/RefreshButton';
import { timeAgoLabel } from '../../client/components/playground/timeUtils';
import IpBlocklistResult from '../../client/components/playground/IpBlocklistResult';
import VpnDetectionResult from '../../client/components/playground/VpnDetectionResult';
import { FormatIpAddress } from '../../client/components/playground/ipFormatUtils';
import { usePlaygroundSignals } from '../../client/components/playground/usePlaygroundSignals';
import { getLocationName } from '../../shared/utils/getLocationName';
import { PLAYGROUND_TAG } from '../../client/components/playground/playgroundTags';
import { CustomPageProps } from '../_app';
import { PLAYGROUND_METADATA } from '../../client/components/common/content';
import Link from 'next/link';
import externalLinkArrow from '../../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import styles from './playground.module.scss';

const DocsLink: FunctionComponent<{ children: ReactNode; href: string; style?: React.CSSProperties }> = ({
  children,
  href,
  style,
}) => {
  return (
    <Link href={href} target="_blank" className={styles.docsLink} style={style}>
      {children}
      <Image src={externalLinkArrow} alt="" />
    </Link>
  );
};

// Map cannot be server-side rendered
const Map = dynamic(() => import('../../client/components/playground/Map'), { ssr: false });

function Playground() {
  const {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    cachedEvent,
    identificationEvent,
    isLoadingServerResponse,
    serverError,
  } = usePlaygroundSignals();

  const hasDarkMode = false;

  const locationName = useMemo<string>(() => {
    return getLocationName(agentResponse?.ipLocation);
  }, [agentResponse]);

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  if (!cachedEvent) {
    return (
      <Stack alignItems={'center'} gap={5}>
        <CircularProgress />
        <Typography variant="h2" textAlign={'center'}>
          Running device intelligence...
        </Typography>
      </Stack>
    );
  }

  const usedIdentificationEvent = identificationEvent ?? cachedEvent;
  const { latitude, longitude } = agentResponse?.ipLocation ?? {};

  const RED = hasDarkMode ? red[900] : red[100];
  const GREEN = hasDarkMode ? green[900] : lightGreen[50];
  const GRAY = hasDarkMode ? blueGrey[900] : blueGrey[50];

  const baseSignals: TableCellData[][] = [
    [
      {
        content: [
          'Visitor ID',
          <Info key="info">A unique and stable identifier for your browser or mobile device.</Info>,
        ],
      },
      { content: agentResponse?.visitorId },
    ],
    [{ content: 'Browser' }, { content: `${agentResponse?.browserName} ${agentResponse?.browserVersion}` }],
    [{ content: 'Operating System' }, { content: `${agentResponse?.os} ${agentResponse?.osVersion}` }],
    [{ content: 'IP Address' }, { content: <FormatIpAddress ipAddress={agentResponse?.ip} /> }],
    [
      {
        content: <DocsLink href="https://dev.fingerprint.com/docs/useful-timestamps#definitions">Last seen</DocsLink>,
      },
      {
        content: agentResponse?.lastSeenAt.global ? timeAgoLabel(agentResponse?.lastSeenAt.global) : 'Unknown',
      },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/understanding-your-confidence-score">
            Confidence <br />
            Score
          </DocsLink>,
        ],
      },
      {
        content: agentResponse?.confidence.score ? Math.trunc(agentResponse.confidence.score * 100) / 100 : 'N/A',
        cellStyle: { backgroundColor: agentResponse && agentResponse.confidence.score >= 0.7 ? GREEN : RED },
      },
    ],
  ];

  const smartSignalsProPlus: TableCellData[][] = [
    [
      {
        content: (
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#ip-geolocation">Geolocation</DocsLink>
        ),
      },
      {
        content: (
          <>
            <div>{locationName}</div>
            {latitude && longitude && (
              <div>
                <Map key={[latitude, longitude].toString()} position={[latitude, longitude]} height="80px" />
              </div>
            )}
          </>
        ),
        cellStyle: { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
      },
    ],
    [
      {
        content: (
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#incognito-detection">
            Incognito Mode
          </DocsLink>
        ),
      },
      {
        content: agentResponse?.incognito ? 'You are incognito 🕶' : 'Not detected',
        cellStyle: {
          backgroundColor: agentResponse?.incognito ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#browser-bot-detection">Bot</DocsLink>,
        ],
      },
      {
        content: <BotDetectionResult key="botDetectionResult" event={usedIdentificationEvent} />,
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.botd?.data?.bot?.result === 'bad' ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#vpn-detection">VPN</DocsLink>,
        ],
      },
      {
        content: <VpnDetectionResult event={usedIdentificationEvent} />,
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.vpn?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#browser-tamper-detection">
            Browser Tampering
          </DocsLink>,
        ],
      },
      {
        content: usedIdentificationEvent?.products?.tampering?.data?.result === true ? 'Yes 🖥️🔧' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.tampering?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: (
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#virtual-machine-detection">
            Virtual Machine
          </DocsLink>
        ),
      },
      {
        content: usedIdentificationEvent?.products?.virtualMachine?.data?.result === true ? 'Yes ☁️💻' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.virtualMachine?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: (
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#privacy-aware-settings">
            Privacy Settings
          </DocsLink>
        ),
      },
      {
        content:
          usedIdentificationEvent?.products?.privacySettings?.data?.result === true ? 'Yes 🙈💻' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.privacySettings?.data?.result === true ? RED : GREEN,
        },
      },
    ],
  ];

  const smartSignalsEnterprise: TableCellData[][] = [
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#ip-blocklist-matching">
            IP Blocklist
          </DocsLink>,
        ],
      },
      {
        content: <IpBlocklistResult event={usedIdentificationEvent} />,
        cellStyle: {
          backgroundColor:
            usedIdentificationEvent?.products?.ipBlocklist?.data?.result ||
            usedIdentificationEvent?.products?.proxy?.data?.result ||
            usedIdentificationEvent?.products?.tor?.data?.result
              ? RED
              : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#raw-device-attributes">
            Raw device attributes
          </DocsLink>,
        ],
      },
      { content: 'Applicable only to browsers. See the JSON below.', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#frida-detection">
            App is instrumented by Frida
          </DocsLink>,
        ],
      },
      { content: 'Applicable only for iOS and Android devices', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#factory-reset-detection">
            Factory Reset Timestamp
          </DocsLink>,
        ],
      },
      { content: 'Applicable only for iOS and Android devices', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#geolocation-spoofing-detection">
            Location spoofing
          </DocsLink>,
        ],
      },
      { content: 'Applicable only for iOS and Android devices', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#cloned-app-detection">
            Cloned App
          </DocsLink>,
        ],
      },
      { content: 'Applicable only to Android devices', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#android-emulator-detection">
            Emulator
          </DocsLink>,
        ],
      },
      { content: 'Applicable only to Android devices', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#android-tamper-detection">
            Rooted device
          </DocsLink>,
        ],
      },
      { content: 'Applicable only to Android devices', cellStyle: { backgroundColor: GRAY } },
    ],

    [
      {
        content: [
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#factory-reset-detection">
            Jailbroken device
          </DocsLink>,
        ],
      },
      { content: 'Applicable only to iOS devices', cellStyle: { backgroundColor: GRAY } },
    ],
  ];

  return (
    <div>
      <Typography variant="h2" textAlign={'center'}>
        Welcome, your visitor ID is{' '}
        <Box sx={{ display: 'inline', color: (t) => t.palette.primary.main, fontWeight: 'bold' }}>
          {agentResponse?.visitorId}
        </Box>
        .
      </Typography>

      <RefreshButton loading={isLoadingAgentResponse || isLoadingServerResponse} getAgentData={getAgentData} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            sm: 'minmax(0, 500px)',
            lg: 'repeat(3, minmax(0, 400px))',
          },
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h3">Base signals (Pro plan)</Typography>
          <MyTable data={baseSignals} />
        </Box>
        <Box>
          <Typography variant="h3">Smart signals (Pro Plus plan)</Typography>
          <MyTable data={smartSignalsProPlus} />
        </Box>
        <Box>
          <Typography variant="h3">Smart signals (Enterprise plan)</Typography>
          <MyTable data={smartSignalsEnterprise} />
        </Box>
      </Box>

      <RefreshButton loading={isLoadingAgentResponse || isLoadingServerResponse} getAgentData={getAgentData} />

      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}
      >
        <Box>
          <Accordion defaultExpanded elevation={3}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="agent-response-content"
              id="agent-response-header"
            >
              <Typography width={'100%'}>JavaScript Agent Response</Typography>
              {isLoadingAgentResponse && (
                <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <CodeSnippet language="json" dataTestId={PLAYGROUND_TAG.agentResponseJSON}>
                {JSON.stringify(agentResponse, null, 2)}
              </CodeSnippet>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box>
          <Accordion defaultExpanded elevation={3}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="server-event-content"
              id="server-event-header"
            >
              <Typography width={'100%'}>Server API Response</Typography>
              {isLoadingServerResponse && (
                <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <CodeSnippet language="json" dataTestId={PLAYGROUND_TAG.serverResponseJSON}>
                {JSON.stringify(usedIdentificationEvent, null, 2)}
              </CodeSnippet>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </div>
  );
}

export default function PlaygroundPage({ embed }: CustomPageProps) {
  return (
    <UseCaseWrapper
      useCase={{
        ...PLAYGROUND_METADATA,
        title: 'Fingerprint Pro Playground',
        description: <p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>,
        doNotMentionResetButton: true,
      }}
      hideGithubLink={true}
      contentSx={{ boxShadow: 'none', maxWidth: '1248px', minHeight: '60vh' }}
      embed={embed}
    >
      <Playground />
    </UseCaseWrapper>
  );
}
