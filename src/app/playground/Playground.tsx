'use client';

import { useEffect, ReactNode } from 'react';
import { CollapsibleJsonViewer } from '../../client/components/common/CodeSnippet/CodeSnippet';
import dynamic from 'next/dynamic';
import SignalTable, { TableCellData } from './components/SignalTable';
import botDetectionResult from './components/BotDetectionResult';
import { RefreshButton } from './components/RefreshButton';
import { ipBlocklistResult } from './components/IpBlocklistResult';
import { vpnDetectionResult } from './components/VpnDetectionResult';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';
import { getLocationName, getZoomLevel } from '../../shared/utils/locationUtils';
import Link from 'next/link';
import styles from './playground.module.scss';
import { Spinner } from '../../client/components/common/Spinner/Spinner';
import { Alert } from '../../client/components/common/Alert/Alert';
import { timeAgoLabel } from '../../shared/timeUtils';
import Container from '../../client/components/common/Container';
import { TEST_IDS } from '../../client/testIDs';
import tableStyles from './components/SignalTable.module.scss';
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
import { motion } from 'framer-motion';
import { JsonLink, DocsLink } from './components/ArrowLinks';

// Nothing magic about `8` here, each customer must define their own use-case specific threshold
const SUSPECT_SCORE_RED_THRESHOLD = 8;

const PLAYGROUND_COPY = {
  androidOnly: (
    <>
      Available in the native{' '}
      <Link href='https://dev.fingerprint.com/docs/native-android-integration' target='_blank'>
        Android SDK
      </Link>
    </>
  ),
  iosOnly: (
    <>
      Available in the native{' '}
      <Link href='https://dev.fingerprint.com/docs/ios' target='_blank'>
        iOS SDK
      </Link>
    </>
  ),
  mobileOnly: (
    <>
      Available in native{' '}
      <Link href='https://dev.fingerprint.com/docs/ios' target='_blank'>
        iOS
      </Link>{' '}
      and{' '}
      <Link href='https://dev.fingerprint.com/docs/native-android-integration' target='_blank'>
        Android
      </Link>{' '}
      SDKs
    </>
  ),
} as const;

// Map cannot be server-side rendered
const Map = dynamic(() => import('./components/Map'), { ssr: false });

const TableTitle = ({ children }: { children: ReactNode }) => (
  <motion.h3
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={styles.tableTitle}
  >
    {children}
  </motion.h3>
);

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

  /**
   * Prevent restoring scroll position on page refresh since there is nothing to scroll to while the data is being loaded
   */
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

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
      {
        content: (
          <JsonLink propertyName='browserVersion' elementOrder='first'>
            {`${agentResponse?.browserName} ${agentResponse?.browserVersion}`}
          </JsonLink>
        ),

        className: tableStyles.neutral,
      },
    ],
    [
      { content: 'Operating System' },
      {
        content: (
          <JsonLink
            propertyName='osVersion'
            elementOrder='first'
          >{`${agentResponse?.os} ${agentResponse?.osVersion}`}</JsonLink>
        ),
        className: tableStyles.neutral,
      },
    ],
    [
      { content: 'IP Address' },
      {
        content: (
          <span className={styles.ipAddress}>
            <JsonLink propertyName='ip' elementOrder='first'>
              {`${agentResponse?.ip}`}
            </JsonLink>
          </span>
        ),
        className: tableStyles.neutral,
      },
    ],
    [
      {
        content: <DocsLink href='https://dev.fingerprint.com/docs/useful-timestamps#definitions'>Last seen</DocsLink>,
      },
      {
        content: agentResponse?.lastSeenAt.global ? (
          <JsonLink propertyName='lastSeenAt' elementOrder='first'>
            {timeAgoLabel(agentResponse?.lastSeenAt.global)}
          </JsonLink>
        ) : (
          'Unknown'
        ),
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
        content: agentResponse?.confidence.score ? (
          <JsonLink propertyName='confidence' elementOrder='first'>
            {String(Math.trunc(agentResponse.confidence.score * 100) / 100)}
          </JsonLink>
        ) : (
          'Not available'
        ),
        className: agentResponse && agentResponse.confidence.score >= 0.7 ? tableStyles.green : tableStyles.red,
      },
    ],
  ];

  const suspectScore = usedIdentificationEvent?.products?.suspectScore?.data?.result;
  const remoteControl: boolean | undefined = usedIdentificationEvent?.products?.remoteControl?.data?.result;

  const ipVelocity: number | undefined =
    usedIdentificationEvent?.products?.velocity?.data?.distinctIp?.intervals?.['1h'];

  const smartSignals: TableCellData[][] = [
    [
      {
        content: (
          <>
            <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-geolocation'>
              Geolocation
            </DocsLink>
            <div className={styles.locationText}>
              <JsonLink propertyName='ipInfo'>{getLocationName(ipLocation)}</JsonLink>
            </div>
          </>
        ),
      },
      {
        content: (
          <>
            {latitude && longitude && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <Map
                  key={[latitude, longitude].toString()}
                  position={[latitude, longitude]}
                  zoom={zoom}
                  height='95px'
                />
              </motion.div>
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
        content: (
          <JsonLink propertyName='incognito'>
            {usedIdentificationEvent?.products?.incognito?.data?.result ? 'You are incognito 🕶' : 'Not detected'}
          </JsonLink>
        ),
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
        content: <JsonLink propertyName='botd'>{botDetectionResult({ event: usedIdentificationEvent })}</JsonLink>,
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
        content: <JsonLink propertyName='vpn'>{vpnDetectionResult({ event: usedIdentificationEvent })}</JsonLink>,
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
        content: (
          <JsonLink propertyName='tampering'>
            {usedIdentificationEvent?.products?.tampering?.data?.result === true ? 'Yes 🖥️🔧' : 'Not detected'}
          </JsonLink>
        ),

        className:
          usedIdentificationEvent?.products?.tampering?.data?.result === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#developer-tools-detection'
            key='devtools'
          >
            Developer Tools
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='developerTools'>
            {usedIdentificationEvent?.products?.developerTools?.data?.result === true ? 'Yes 🔧' : 'Not detected'}
          </JsonLink>
        ),
        className:
          usedIdentificationEvent?.products?.developerTools?.data?.result === true
            ? tableStyles.red
            : tableStyles.green,
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
        content: (
          <JsonLink propertyName='virtualMachine'>
            {usedIdentificationEvent?.products?.virtualMachine?.data?.result === true ? 'Yes ☁️💻' : 'Not detected'}
          </JsonLink>
        ),

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
        content: (
          <JsonLink propertyName='privacySettings'>
            {usedIdentificationEvent?.products?.privacySettings?.data?.result === true ? 'Yes 🙈💻' : 'Not detected'}
          </JsonLink>
        ),
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
        content:
          remoteControl === undefined ? (
            'Not available'
          ) : (
            <JsonLink propertyName='remoteControl'>{remoteControl === true ? 'Yes 🕹️' : 'Not detected'}</JsonLink>
          ),
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
        content: (
          <JsonLink propertyName='ipBlocklist'>{ipBlocklistResult({ event: usedIdentificationEvent })}</JsonLink>
        ),
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
        content: (
          <JsonLink propertyName='highActivity'>
            {usedIdentificationEvent?.products?.highActivity?.data?.result === true ? 'Yes 🔥' : 'Not detected'}
          </JsonLink>
        ),

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
        content: (
          <JsonLink propertyName='velocity'>
            {ipVelocity === undefined ? 'Not available' : `${pluralize(ipVelocity, 'IP')} in the past hour`}
          </JsonLink>
        ),
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
        content:
          suspectScore !== undefined ? (
            <JsonLink propertyName='suspectScore'>{String(suspectScore)}</JsonLink>
          ) : (
            'Not available'
          ),
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
      {
        content: <JsonLink propertyName='rawDeviceAttributes'>See the JSON below</JsonLink>,
        className: tableStyles.green,
      },
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
      <Container size='large'>
        <div className={styles.runningIntelligence}>
          {!cachedEvent ? (
            <h2>
              Running Device Intelligence<span className={styles.blink}>_</span>
            </h2>
          ) : (
            <RefreshButton
              loading={isLoadingAgentResponse || isLoadingServerResponse}
              getAgentData={getAgentData}
              className={styles.reloadButton}
            />
          )}
        </div>
      </Container>
      <>
        <Container size='large'>
          <div className={styles.tablesContainer}>
            {agentResponse ? (
              <MyCollapsible defaultOpen>
                <TableTitle>
                  Identification{' '}
                  <MyCollapsibleTrigger>
                    <ChevronSvg />
                  </MyCollapsibleTrigger>
                </TableTitle>
                <MyCollapsibleContent>
                  <div className={styles.visitorIdBox}>
                    <p>Your Visitor ID is </p>
                    <h2 className={styles.visitorId}>{agentResponse?.visitorId}</h2>
                  </div>

                  <SignalTable data={identificationSignals} />
                </MyCollapsibleContent>
              </MyCollapsible>
            ) : (
              // Spacer element to push footer down when no data is ready
              <div style={{ height: '800px' }} />
            )}
            {cachedEvent ? (
              <>
                <MyCollapsible defaultOpen>
                  <TableTitle>
                    Smart signals{' '}
                    <MyCollapsibleTrigger>
                      <ChevronSvg />
                    </MyCollapsibleTrigger>
                  </TableTitle>
                  <MyCollapsibleContent>
                    <SignalTable data={smartSignals} />
                  </MyCollapsibleContent>
                </MyCollapsible>
                <MyCollapsible defaultOpen>
                  <TableTitle>
                    Mobile Smart signals{' '}
                    <MyCollapsibleTrigger>
                      <ChevronSvg />
                    </MyCollapsibleTrigger>
                  </TableTitle>
                  <MyCollapsibleContent>
                    <SignalTable data={mobileSmartSignals} />
                  </MyCollapsibleContent>
                </MyCollapsible>
              </>
            ) : null}
          </div>
        </Container>
        {cachedEvent ? (
          <>
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
        ) : null}
      </>
    </>
  );
}

export default Playground;
