'use client';

import { FunctionComponent, ReactNode } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import { green, red } from '@mui/material/colors';
import { lightGreen } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';
import dynamic from 'next/dynamic';
import MyTable, { TableCellData } from './components/MyTable';
import BotDetectionResult from './components/BotDetectionResult';
import Info from './components/InfoIcon';
import RefreshButton from './components/RefreshButton';
import IpBlocklistResult from './components/IpBlocklistResult';
import VpnDetectionResult from './components/VpnDetectionResult';
import { FormatIpAddress } from './components/ipFormatUtils';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';
import { getLocationName } from '../../shared/utils/locationUtils';
import { FP_LOAD_OPTIONS } from '../../pages/_app';
import Link from 'next/link';
import externalLinkArrow from '../../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import styles from './playground.module.scss';
import { Spinner } from '../../client/components/common/Spinner/Spinner';
import { Alert } from '../../client/components/common/Alert/Alert';
import { timeAgoLabel } from '../../shared/timeUtils';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import Container from '../../client/components/common/Container';
import { TEST_IDS } from '../../client/testIDs';

const PLAYGROUND_COPY = {
  androidOnly: 'Applicable only to Android devices',
  iosOnly: 'Applicable only to iOS devices',
  mobileOnly: 'Applicable only to iOS and Android devices',
} as const;

// Nothing magic about `8` here, each customer must define their own use-case specific threshold
const SUSPECT_SCORE_RED_THRESHOLD = 8;

const DocsLink: FunctionComponent<{ children: ReactNode; href: string; style?: React.CSSProperties }> = ({
  children,
  href,
  style,
}) => {
  return (
    <Link href={href} target='_blank' className={styles.docsLink} style={style}>
      {children}
      <Image src={externalLinkArrow} alt='' />
    </Link>
  );
};

// Map cannot be server-side rendered
const Map = dynamic(() => import('./components/Map'), { ssr: false });

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

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  const usedIdentificationEvent = identificationEvent ?? cachedEvent;
  const ipLocation = usedIdentificationEvent?.products?.ipInfo?.data?.v4?.geolocation;
  const { latitude, longitude } = ipLocation ?? {};

  const RED = hasDarkMode ? red[900] : red[100];
  const GREEN = hasDarkMode ? green[900] : lightGreen[50];
  const GRAY = hasDarkMode ? blueGrey[900] : blueGrey[50];

  const identificationSignals: TableCellData[][] = [
    [
      {
        content: [
          'Visitor ID',
          <Info key='info'>A unique and stable identifier for your browser or mobile device.</Info>,
        ],
      },
      { content: agentResponse?.visitorId },
    ],
    [{ content: 'Browser' }, { content: `${agentResponse?.browserName} ${agentResponse?.browserVersion}` }],
    [{ content: 'Operating System' }, { content: `${agentResponse?.os} ${agentResponse?.osVersion}` }],
    [{ content: 'IP Address' }, { content: <FormatIpAddress ipAddress={agentResponse?.ip} /> }],
    [
      {
        content: <DocsLink href='https://dev.fingerprint.com/docs/useful-timestamps#definitions'>Last seen</DocsLink>,
      },
      {
        content: agentResponse?.lastSeenAt.global ? timeAgoLabel(agentResponse?.lastSeenAt.global) : 'Unknown',
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/understanding-your-confidence-score' key='confidence'>
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

  const smartSignals: TableCellData[][] = [
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-geolocation'>Geolocation</DocsLink>
        ),
      },
      {
        content: (
          <>
            <div>{getLocationName(ipLocation)}</div>
            {latitude && longitude && (
              <div>
                <Map key={[latitude, longitude].toString()} position={[latitude, longitude]} height='80px' />
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
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-incognito-detection'>
            Incognito Mode
          </DocsLink>
        ),
      },
      {
        content: usedIdentificationEvent?.products?.incognito?.data?.result ? 'You are incognito 🕶' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.incognito?.data?.result ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-bot-detection' key='bot'>
            Bot
          </DocsLink>,
        ],
      },
      {
        content: <BotDetectionResult key='botDetectionResult' event={usedIdentificationEvent} />,
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.botd?.data?.bot?.result === 'bad' ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#vpn-detection' key='vpn'>
            VPN
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
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-tamper-detection'
            key='tamper'
          >
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
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#virtual-machine-detection'>
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
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#privacy-focused-settings'>
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
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-blocklist-matching'
            key='blocklist'
          >
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
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#high-activity-device'
            key='high-activity'
          >
            High-Activity Device
          </DocsLink>,
        ],
      },
      {
        content: usedIdentificationEvent?.products?.highActivity?.data?.result === true ? 'Yes 🔥' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.highActivity?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#suspect-score' key='suspect-score'>
            Suspect Score
          </DocsLink>,
        ],
      },
      {
        // @ts-expect-error suspectScore not yet available in Node SDK, TODO: remove this once it's available
        content: usedIdentificationEvent?.products?.suspectScore?.data?.result,
        cellStyle: {
          backgroundColor:
            // @ts-expect-error suspectScore not yet available in Node SDK, TODO: remove this once it's available
            usedIdentificationEvent?.products?.suspectScore?.data?.result > SUSPECT_SCORE_RED_THRESHOLD ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#raw-device-attributes' key='raw'>
            Raw device attributes
          </DocsLink>,
        ],
      },
      { content: 'See the JSON below', cellStyle: { backgroundColor: GREEN } },
    ],
  ];

  const mobileSmartSignals: TableCellData[][] = [
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#frida-detection' key='frida'>
            App is instrumented by Frida
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#factory-reset-detection' key='reset'>
            Factory Reset Timestamp
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#geolocation-spoofing-detection'
            key='spoof'
          >
            Location spoofing
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#cloned-app-detection' key='cloned'>
            Cloned App
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#android-emulator-detection'
            key='emulator'
          >
            Emulator
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#android-tamper-detection'
            key='tamper'
          >
            Rooted device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, cellStyle: { backgroundColor: GRAY } },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#jailbroken-device-detection'
            key='jailbroken'
          >
            Jailbroken device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.iosOnly, cellStyle: { backgroundColor: GRAY } },
    ],
  ];

  return (
    <Container size='large'>
      <div className={styles.hero}>
        <h1>
          <span>Fingerprint Pro</span> Playground
        </h1>
        <p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>
      </div>
      {agentResponse && (
        <div className={styles.visitorIdBox}>
          <p>Welcome, this is your visitor ID</p>
          <h2 className={styles.visitorId}>{agentResponse?.visitorId}</h2>
        </div>
      )}
      {!cachedEvent ? (
        <div className={styles.runningIntelligence}>
          <Spinner size='40px' thickness={3} />
          <h2>Running device intelligence...</h2>
        </div>
      ) : (
        <>
          <div className={styles.tablesContainer}>
            <div>
              <h3 className={styles.tableTitle}>Identification</h3>
              <MyTable data={identificationSignals} />
            </div>
            <div>
              <h3 className={styles.tableTitle}>Smart signals</h3>
              <MyTable data={smartSignals} />
            </div>
            <div>
              <h3 className={styles.tableTitle}>Mobile Smart signals</h3>
              <MyTable data={mobileSmartSignals} />
            </div>
          </div>

          <RefreshButton
            loading={isLoadingAgentResponse || isLoadingServerResponse}
            getAgentData={getAgentData}
            className={styles.reloadButton}
          />

          <div className={styles.jsonContainer}>
            <div>
              <h4 className={styles.jsonTitle}>JavaScript Agent Response {isLoadingAgentResponse && <Spinner />}</h4>

              <CodeSnippet language='json' dataTestId={TEST_IDS.playground.agentResponseJSON}>
                {JSON.stringify(agentResponse, null, 2)}
              </CodeSnippet>
            </div>
            <div>
              <h4 className={styles.jsonTitle}>Server API Response {isLoadingServerResponse && <Spinner />}</h4>

              <CodeSnippet language='json' dataTestId={TEST_IDS.playground.serverResponseJSON}>
                {JSON.stringify(usedIdentificationEvent, null, 2)}
              </CodeSnippet>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

export default function PlaygroundPage() {
  return (
    <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
      <Playground />
    </FpjsProvider>
  );
}
