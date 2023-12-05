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

const DocsLink: FunctionComponent<{ children: ReactNode; href: string }> = ({ children, href }) => {
  return (
    <Link href={href} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {children}
      <Image src={externalLinkArrow} alt="" width={11} height={11} />
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
        content: [
          'Last seen',
          <Info key="info">The last time the Fingerprint has encountered that visitor ID (globally).</Info>,
        ],
      },
      {
        content: agentResponse?.lastSeenAt.global ? timeAgoLabel(agentResponse?.lastSeenAt.global) : 'Unknown',
      },
    ],
    [
      {
        content: [
          'Confidence Score',
          <Info key="info">
            A value between 0 and 1 representing how confident we are about this identification, depending on the
            available signals.
          </Info>,
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
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#browser-bot-detection">
            Bot Detection
          </DocsLink>,
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
          <DocsLink href="https://dev.fingerprint.com/docs/smart-signals-overview#vpn-detection">
            VPN Detection
          </DocsLink>,
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
          'IP Blocklist',
          <Info key="info">
            IP address was part of a known email (SMTP) spam attack or network (SSH/HTTP) attack.{' '}
          </Info>,
        ],
      },
      {
        content: <IpBlocklistResult event={usedIdentificationEvent} />,
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.ipBlocklist?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: ['Proxy', <Info key="info">The request IP address is used by a public proxy provider.</Info>],
      },
      {
        content:
          usedIdentificationEvent?.products?.proxy?.data?.result === true ? 'You are using a proxy 🔄' : 'Not detected',
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.proxy?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: ['Tor Network', <Info key="info">The request IP address is a known Tor network exit node.</Info>],
      },
      {
        content:
          usedIdentificationEvent?.products?.tor?.data?.result === true ? 'You are using Tor 🧅' : 'Not detected',
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.tor?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: ['Android Emulator', <Info key="info">Android specific emulator detection.</Info>],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          'Android Tampering',
          <Info key="info">Android specific root management apps detection, for example, Magisk.</Info>,
        ],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          'Android Cloned Application',
          <Info key="info">Android-specific detection of a fully cloned application present on the device.</Info>,
        ],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          'Android Factory Reset',
          <Info key="info">Timestamp of a recent factory reset on an Android device.</Info>,
        ],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: ['iOS Jailbreak', <Info key="info">Jailbreak detected on an iOS device.</Info>],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          'iOS Frida installation',
          <Info key="info">
            Frida installation detected on an iOS device. Frida is a code-orchestration tool allowing to inject
            arbitrary code into the operating system.
          </Info>,
        ],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
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
