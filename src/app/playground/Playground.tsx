'use client';

import { FunctionComponent } from 'react';
import { CollapsibleJsonViewer } from '../../client/components/common/CodeSnippet/CodeSnippet';
import dynamic from 'next/dynamic';
import SignalTable, { TableCellData } from './components/SignalTable';
import BotDetectionResult from './components/BotDetectionResult';
import { RefreshButton } from './components/RefreshButton';
import IpBlocklistResult from './components/IpBlocklistResult';
import VpnDetectionResult from './components/VpnDetectionResult';
import { FormatIpAddress } from './components/ipFormatUtils';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';
import { getLocationName, getZoomLevel } from '../../shared/utils/locationUtils';
import { FP_LOAD_OPTIONS } from '../../pages/_app';
import Link from 'next/link';
import styles from './playground.module.scss';
import { Spinner } from '../../client/components/common/Spinner/Spinner';
import { Alert } from '../../client/components/common/Alert/Alert';
import { timeAgoLabel } from '../../shared/timeUtils';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import Container from '../../client/components/common/Container';
import { TEST_IDS } from '../../client/testIDs';
import tableStyles from './components/SignalTable.module.scss';
import { ExternalLinkArrowSvg } from '../../client/img/externalLinkArrowSvg';
import { HowToUseThisPlayground } from './components/HowToUseThisPlayground';
import classnames from 'classnames';
import { ResourceLinks } from '../../client/components/common/ResourceLinks/ResourceLinks';
import {
  MyCollapsible,
  MyCollapsibleTrigger,
  MyCollapsibleContent,
} from '../../client/components/common/Collapsible/Collapsible';
import { ChevronSvg } from '../../client/img/chevronSvg';
import { pluralize } from '../../shared/utils';

const PLAYGROUND_COPY = {
  androidOnly: 'Applicable only to Android devices',
  iosOnly: 'Applicable only to iOS devices',
  mobileOnly: 'Applicable only to iOS and Android devices',
} as const;

// Nothing magic about `8` here, each customer must define their own use-case specific threshold
const SUSPECT_SCORE_RED_THRESHOLD = 8;

const DocsLink: FunctionComponent<{ children: string; href: string; style?: React.CSSProperties }> = ({
  children,
  href,
  style,
}) => {
  const lastWord = children.split(' ').pop();
  const leadingWords = children.split(' ').slice(0, -1).join(' ');
  return (
    <Link href={href} target='_blank' className={styles.docsLink} style={style}>
      {leadingWords}{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}
        <ExternalLinkArrowSvg className={styles.externalLinkArrow} />
      </span>
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

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  const usedIdentificationEvent = identificationEvent ?? cachedEvent;
  const { ipLocation, ...displayedAgentResponse } = agentResponse ?? {};
  const { latitude, longitude, accuracyRadius } = ipLocation ?? {};
  const zoom = getZoomLevel(accuracyRadius);

  const identificationSignals: TableCellData[][] = [
    [
      { content: 'Browser' },
      { content: `${agentResponse?.browserName} ${agentResponse?.browserVersion}`, className: tableStyles.neutral },
    ],
    [
      { content: 'Operating System' },
      { content: `${agentResponse?.os} ${agentResponse?.osVersion}`, className: tableStyles.neutral },
    ],
    [
      { content: 'IP Address' },
      { content: <FormatIpAddress ipAddress={agentResponse?.ip} />, className: tableStyles.neutral },
    ],
    [
      {
        content: <DocsLink href='https://dev.fingerprint.com/docs/useful-timestamps#definitions'>Last seen</DocsLink>,
      },
      {
        content: agentResponse?.lastSeenAt.global ? timeAgoLabel(agentResponse?.lastSeenAt.global) : 'Unknown',
        className: tableStyles.neutral,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/understanding-your-confidence-score' key='confidence'>
            Confidence Score
          </DocsLink>,
        ],
      },
      {
        content: agentResponse?.confidence.score ? Math.trunc(agentResponse.confidence.score * 100) / 100 : 'N/A',
        className: agentResponse && agentResponse.confidence.score >= 0.7 ? tableStyles.green : tableStyles.red,
      },
    ],
  ];

  const suspectScore = usedIdentificationEvent?.products?.suspectScore?.data?.result;
  // @ts-expect-error Not supported in Node SDK yet
  const remoteControl: boolean | undefined = usedIdentificationEvent?.products?.remoteControl?.data?.result;
  // @ts-expect-error Not supported in Node SDK yet
  const ipVelocity: number | undefined = usedIdentificationEvent?.products?.velocity?.data?.distinctIp.intervals['1h'];

  const smartSignals: TableCellData[][] = [
    [
      {
        content: (
          <>
            <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-geolocation'>
              Geolocation
            </DocsLink>
            <div className={styles.locationText}>{getLocationName(ipLocation)}</div>
          </>
        ),
      },
      {
        content: (
          <>
            {latitude && longitude && (
              <div>
                <Map
                  key={[latitude, longitude].toString()}
                  position={[latitude, longitude]}
                  zoom={zoom}
                  height='95px'
                />
              </div>
            )}
          </>
        ),
        className: tableStyles.map,
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
        className: usedIdentificationEvent?.products?.incognito?.data?.result ? tableStyles.red : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.botd?.data?.bot?.result === 'bad' ? tableStyles.red : tableStyles.green,
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
        className: usedIdentificationEvent?.products?.vpn?.data?.result === true ? tableStyles.red : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.tampering?.data?.result === true ? tableStyles.red : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.virtualMachine?.data?.result === true
            ? tableStyles.red
            : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.privacySettings?.data?.result === true
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#remote-control-tools-detection'
            key='remote-control-tools'
          >
            Remote Control Tools
          </DocsLink>,
        ],
      },
      {
        content: remoteControl === undefined ? 'Not available' : remoteControl === true ? 'Yes 🕹️' : 'Not detected',
        className:
          remoteControl === undefined
            ? tableStyles.neutral
            : remoteControl === true
              ? tableStyles.red
              : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.ipBlocklist?.data?.result ||
          usedIdentificationEvent?.products?.proxy?.data?.result ||
          usedIdentificationEvent?.products?.tor?.data?.result
            ? tableStyles.red
            : tableStyles.green,
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
        className:
          usedIdentificationEvent?.products?.highActivity?.data?.result === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#velocity-signals' key='velocity '>
            Velocity signals
          </DocsLink>,
        ],
      },
      {
        content: ipVelocity === undefined ? 'Not available' : `${pluralize(ipVelocity, 'IP')} in the past hour`,
        className:
          ipVelocity === undefined ? tableStyles.neutral : ipVelocity > 1 ? tableStyles.red : tableStyles.green,
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
        content: usedIdentificationEvent?.products?.suspectScore?.data?.result ?? 'Not available',
        className:
          suspectScore === undefined
            ? tableStyles.neutral
            : suspectScore > SUSPECT_SCORE_RED_THRESHOLD
              ? tableStyles.red
              : tableStyles.green,
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
      { content: 'See the JSON below', className: tableStyles.green },
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
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#factory-reset-detection' key='reset'>
            Factory Reset Timestamp
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
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
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#cloned-app-detection' key='cloned'>
            Cloned App
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
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
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
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
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
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
      { content: PLAYGROUND_COPY.iosOnly, className: tableStyles.neutral },
    ],
  ];

  return (
    <>
      <Container size='large' className={styles.hero}>
        <h1>
          <span>Fingerprint Pro</span> Playground
        </h1>
        <p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>
      </Container>
      {agentResponse && (
        <Container size='large'>
          <div className={styles.visitorIdBox}>
            <p>Welcome, this is your visitor ID</p>
            <h2 className={styles.visitorId}>{agentResponse?.visitorId}</h2>
          </div>
        </Container>
      )}
      {!cachedEvent ? (
        <Container size='large'>
          <div className={styles.runningIntelligence}>
            <Spinner size={64} />
            <h2>
              Running Device Intelligence<span className={styles.blink}>_</span>
            </h2>
          </div>
        </Container>
      ) : (
        <>
          <Container size='large'>
            <RefreshButton
              loading={isLoadingAgentResponse || isLoadingServerResponse}
              getAgentData={getAgentData}
              className={styles.reloadButton}
            />

            <div className={styles.tablesContainer}>
              <MyCollapsible defaultOpen>
                <h3 className={styles.tableTitle}>
                  Identification{' '}
                  <MyCollapsibleTrigger>
                    <ChevronSvg />
                  </MyCollapsibleTrigger>
                </h3>
                <MyCollapsibleContent>
                  <SignalTable data={identificationSignals} />
                </MyCollapsibleContent>
              </MyCollapsible>

              <MyCollapsible defaultOpen>
                <h3 className={styles.tableTitle}>
                  Smart signals{' '}
                  <MyCollapsibleTrigger>
                    <ChevronSvg />
                  </MyCollapsibleTrigger>
                </h3>
                <MyCollapsibleContent>
                  <SignalTable data={smartSignals} />
                </MyCollapsibleContent>
              </MyCollapsible>
              <MyCollapsible defaultOpen>
                <h3 className={styles.tableTitle}>
                  Mobile Smart signals{' '}
                  <MyCollapsibleTrigger>
                    <ChevronSvg />
                  </MyCollapsibleTrigger>
                </h3>
                <MyCollapsibleContent>
                  <SignalTable data={mobileSmartSignals} />
                </MyCollapsibleContent>
              </MyCollapsible>
            </div>
          </Container>

          <Container size='large' className={styles.isSection}>
            <h2 className={styles.sectionTitle}>How to use this demo</h2>
            <HowToUseThisPlayground />
          </Container>
          <Container size='large' className={classnames(styles.isSection, styles.jsonSection)}>
            <div className={styles.jsonContainer}>
              <div>
                <h4 className={styles.jsonTitle}>
                  JavaScript Agent Response {isLoadingAgentResponse && <Spinner size={16} />}
                </h4>
                <CollapsibleJsonViewer
                  dataTestId={TEST_IDS.playground.agentResponseJSON}
                  json={displayedAgentResponse ?? {}}
                />
              </div>
              <div>
                <h4 className={styles.jsonTitle}>
                  Server API Response {isLoadingServerResponse && <Spinner size={16} />}
                </h4>
                <CollapsibleJsonViewer
                  dataTestId={TEST_IDS.playground.serverResponseJSON}
                  json={usedIdentificationEvent ?? {}}
                />
              </div>
            </div>
          </Container>
          <Container size='large' className={styles.learnMoreSection}>
            <h2 className={styles.sectionTitle}>Learn more</h2>
          </Container>
          <ResourceLinks
            resources={[
              {
                title: 'Quick Start Guide',
                url: 'https://dev.fingerprint.com/docs/quick-start-guide',
                type: 'Article',
              },
              {
                title: 'What is Fingerprint',
                url: 'https://dev.fingerprint.com/docs/what-is-fingerprint',
                type: 'Article',
              },
              {
                title: 'Intro to Device Intelligence Webinar',
                url: 'https://www.youtube.com/watch?v=YTRmWUeQWyY',
                type: 'Webinar',
              },
            ]}
          />
        </>
      )}
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
      <Playground />
    </FpjsProvider>
  );
}
