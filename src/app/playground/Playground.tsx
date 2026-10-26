// Browser signals and their Server API event. https://docs.fingerprint.com/docs/smart-signals-reference
'use client';

import { useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { Fingerprint, FingerprintContext, FingerprintContextInterface } from '@fingerprint/react';
import { FP_LOAD_OPTIONS } from '../Providers';
import { CollapsibleJsonViewer } from '../../client/components/CodeSnippet/CodeSnippet';
import dynamic from 'next/dynamic';
import SignalTable, { TableCellData } from './components/SignalTable';
import botDetectionResult from './components/BotDetectionResult';
import { RefreshButton } from './components/RefreshButton';
import { ipBlocklistResult } from './components/IpBlocklistResult';
import { proxyDetectionResult } from './components/ProxyDetectionResult';
import { vpnDetectionResult } from './components/VpnDetectionResult';
import { ProximityDetectionResult } from './components/ProximityDetectionResult';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';
import { getLocationName, getZoomLevel } from '../../utils/locationUtils';
import Link from 'next/link';
import styles from './playground.module.scss';
import { Spinner } from '../../client/components/Spinner/Spinner';
import { Alert } from '../../client/components/Alert/Alert';
import { timeAgoLabel } from '../../utils/timeUtils';
import Container from '../../client/components/Container';
import { TEST_IDS } from '../../client/testIDs';
import tableStyles from './components/SignalTable.module.scss';
import { HowToUseThisPlayground } from './components/HowToUseThisPlayground';
import classnames from 'classnames';
import { ResourceLinks } from '../../client/components/ResourceLinks/ResourceLinks';
import {
  MyCollapsible,
  MyCollapsibleTrigger,
  MyCollapsibleContent,
} from '../../client/components/Collapsible/Collapsible';
import { ChevronSvg } from '../../client/img/chevronSvg';
import { pluralize } from '../../utils/utils';
import { motion } from 'framer-motion';
import { JsonLink, DocsLink } from './components/ArrowLinks';
import { LayoutUI } from '../LayoutUI';
import Image from 'next/image';
import GooglePlaySvg from './img/google_play.svg';
import AppStoreSvg from './img/app_store.svg';

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

function formatRequestError(agentError?: Error | null, serverError?: Error | null) {
  return agentError
    ? `JavaScript Agent Error: ${agentError.message}.`
    : `Server API Request ${serverError?.toString()}.`;
}

/**
 * The Server API returns the literal string "Not Available" when it cannot detect a version,
 * for example `browser_full_version` for "Chromium-Based Browser" on Android tablets.
 * Printing it reads like the signal is broken, so show just the name instead.
 * The raw value is still visible in the Server API Response JSON.
 */
function formatNameWithVersion(name: string | undefined, version: string | undefined) {
  if (!version || version === 'Not Available') {
    return `${name}`;
  }
  return `${name} ${version}`;
}

// Bound location collection and follow-ups to the browser acquisition budget.
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#timeout
const PLAYGROUND_LOCATION_TIMEOUT_MS = 10000;
const PLAYGROUND_LOCATION_CHECK_INTERVAL_MS = 1000;

type LocationIdentification = FingerprintContextInterface & {
  attempt: number;
  expiresAt: number;
  complete: () => void;
};

type LocationCheck =
  | { status: 'preparing' }
  | { status: 'collecting'; expiresAt: number }
  | { status: 'finalizing'; expiresAt: number }
  | { status: 'identified'; eventId: string }
  | { status: 'complete' };

export function Playground() {
  const [locationIdentification, setLocationIdentification] = useState<LocationIdentification>();
  const locationAttempt = locationIdentification?.attempt ?? 0;
  const locationWatchRef = useRef<{ id: number; attempt: number } | undefined>(undefined);
  const stopWatchingLocation = useCallback((attempt?: number) => {
    const watch = locationWatchRef.current;
    if (!watch || (attempt !== undefined && watch.attempt !== attempt)) return;
    navigator.geolocation.clearWatch(watch.id);
    locationWatchRef.current = undefined;
  }, []);

  useEffect(() => () => stopWatchingLocation(), [stopWatchingLocation]);

  const requestLocation = (onError: (error: GeolocationPositionError | Error) => void) => {
    stopWatchingLocation();
    const attempt = locationAttempt + 1;
    // Keep the native location request active until this analysis finishes.
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
    let agent: ReturnType<typeof Fingerprint.start> | undefined;
    const watchId = navigator.geolocation.watchPosition(
      () => {
        if (agent || locationWatchRef.current?.id !== watchId) return;
        // The initial agent started before consent, so collect with a fresh instance.
        // https://docs.fingerprint.com/reference/js-agent-start-function
        agent = Fingerprint.start(FP_LOAD_OPTIONS);
        const locationAgent = agent;
        const expiresAt = performance.now() + PLAYGROUND_LOCATION_TIMEOUT_MS;
        // Collect before replacing the UI, then allow the documented initialization period.
        // https://docs.fingerprint.com/reference/js-agent-get-function
        void locationAgent
          .collect({ timeout: PLAYGROUND_LOCATION_TIMEOUT_MS })
          .then(
            () =>
              new Promise<void>((resolve) =>
                window.setTimeout(
                  resolve,
                  Math.min(PLAYGROUND_LOCATION_CHECK_INTERVAL_MS, Math.max(0, expiresAt - performance.now())),
                ),
              ),
          )
          .then(() => {
            if (locationWatchRef.current?.id !== watchId) return;
            // Serialize overlapping requests so an older result cannot replace the final check.
            // https://docs.fingerprint.com/reference/js-agent-get-function
            let previousRequest: Promise<unknown> = Promise.resolve();
            setLocationIdentification({
              attempt,
              expiresAt,
              complete: () => stopWatchingLocation(attempt),
              getVisitorData: (options) => {
                const request = previousRequest.catch(() => undefined).then(() => locationAgent.get(options));
                previousRequest = request;
                return request;
              },
            });
          })
          .catch((error: unknown) => {
            if (locationWatchRef.current?.id !== watchId) return;
            stopWatchingLocation(attempt);
            onError(error instanceof Error ? error : new Error(String(error)));
          });
      },
      (error) => {
        if (agent || locationWatchRef.current?.id !== watchId) return;
        stopWatchingLocation(attempt);
        onError(error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: PLAYGROUND_LOCATION_TIMEOUT_MS },
    );
    locationWatchRef.current = { id: watchId, attempt };
  };

  const content = <PlaygroundContent onLocationRequest={requestLocation} locationRequest={locationIdentification} />;

  // Collection starts when the agent starts. Rebuild it after permission changes.
  // https://docs.fingerprint.com/reference/js-agent-start-function
  return locationIdentification ? (
    <FingerprintContext.Provider key={locationAttempt} value={locationIdentification}>
      {content}
    </FingerprintContext.Provider>
  ) : (
    content
  );
}

function PlaygroundContent({
  onLocationRequest,
  locationRequest,
}: {
  onLocationRequest: (onError: (error: GeolocationPositionError | Error) => void) => void;
  locationRequest?: Pick<LocationIdentification, 'expiresAt' | 'complete'>;
}) {
  const {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    identificationEvent,
    isPendingServerResponse,
    serverError,
  } = usePlaygroundSignals();

  const [locationCheck, setLocationCheck] = useState<LocationCheck>({
    status: 'collecting',
    expiresAt: locationRequest?.expiresAt ?? 0,
  });

  const isPreparingLocation = locationCheck.status === 'preparing';

  const requestLocation = (onError: (error: GeolocationPositionError | Error) => void) => {
    setLocationCheck({ status: 'preparing' });
    onLocationRequest((error) => {
      setLocationCheck({ status: 'complete' });
      onError(error);
    });
  };

  useEffect(() => {
    if (!locationRequest || isPreparingLocation || !('permissions' in navigator)) return;
    let permission: PermissionStatus | undefined;
    let cancelled = false;
    // Firefox can prompt again for the SDK read. Resume if that Allow arrives after our deadline.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1752141
    const resumeLocationCheck = () => {
      if (cancelled || permission?.state !== 'granted') return;
      setLocationCheck({ status: 'collecting', expiresAt: performance.now() + PLAYGROUND_LOCATION_TIMEOUT_MS });
      void getAgentData().catch(() => undefined);
    };
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return;
        permission = result;
        result.addEventListener('change', resumeLocationCheck);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      permission?.removeEventListener('change', resumeLocationCheck);
    };
  }, [locationRequest, getAgentData, isPreparingLocation]);

  useEffect(() => {
    if (
      locationCheck.status !== 'preparing' &&
      locationCheck.status !== 'complete' &&
      (agentError ||
        serverError ||
        (locationCheck.status === 'identified' && identificationEvent?.event_id === locationCheck.eventId))
    ) {
      setLocationCheck({ status: 'complete' });
    }
  }, [locationCheck, identificationEvent?.event_id, agentError, serverError]);

  useEffect(() => {
    if (
      !locationRequest ||
      locationCheck.status !== 'collecting' ||
      identificationEvent?.proximity ||
      agentError ||
      serverError
    )
      return;
    const timeout = window.setTimeout(
      () => {
        locationRequest.complete();
        const expiresAt = locationCheck.expiresAt;
        setLocationCheck({ status: 'finalizing', expiresAt });
        // Include the last collected location after stopping the native watch.
        // https://docs.fingerprint.com/reference/js-agent-get-function
        void getAgentData()
          .then((result) =>
            setLocationCheck((current) =>
              current.status === 'finalizing' && current.expiresAt === expiresAt
                ? { status: 'identified', eventId: result.event_id }
                : current,
            ),
          )
          .catch(() => undefined);
      },
      Math.max(0, locationCheck.expiresAt - performance.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [locationRequest, locationCheck, identificationEvent?.proximity, agentError, serverError, getAgentData]);

  useEffect(() => {
    if (!locationRequest) return;
    if (agentError || serverError) {
      locationRequest.complete();
      return;
    }
    if (!identificationEvent) return;
    if (identificationEvent.proximity || locationCheck.status !== 'collecting') {
      locationRequest.complete();
      return;
    }
    const remaining = locationCheck.expiresAt - performance.now();
    if (remaining <= 0) {
      locationRequest.complete();
      return;
    }
    // A new event can include location that finished after the previous identification.
    // https://docs.fingerprint.com/reference/js-agent-get-function
    const retry = window.setTimeout(
      () => {
        if (performance.now() >= locationCheck.expiresAt) {
          locationRequest.complete();
          return;
        }
        void getAgentData().catch(() => undefined);
      },
      Math.min(PLAYGROUND_LOCATION_CHECK_INTERVAL_MS, remaining),
    );
    return () => window.clearTimeout(retry);
  }, [locationRequest, identificationEvent, agentError, serverError, getAgentData, locationCheck]);

  const isCollectingLocation =
    isPreparingLocation ||
    Boolean(
      locationRequest &&
        !agentError &&
        !serverError &&
        (locationCheck.status === 'collecting' ? !identificationEvent?.proximity : locationCheck.status !== 'complete'),
    );

  const requestError = agentError ?? serverError;
  // Track which error the user dismissed so a new failure re-shows the inline alert.
  const [dismissedError, setDismissedError] = useState<unknown>(null);

  const identificationData = identificationEvent?.identification;

  /**
   * Prevent restoring scroll position on page refresh since there is nothing to scroll to while the data is being loaded
   */
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  if (requestError && !identificationEvent) {
    return (
      <Alert severity='error'>
        {formatRequestError(agentError, serverError)}
        {locationRequest && (
          <ProximityDetectionResult
            event={undefined}
            onLocationRequest={requestLocation}
            scrollToResult
            isCollectingLocation={isCollectingLocation}
          />
        )}
      </Alert>
    );
  }

  const ipLocation = identificationEvent?.ip_info?.v4?.geolocation;
  const { latitude, longitude, accuracy_radius: accuracyRadius } = ipLocation ?? {};
  const zoom = getZoomLevel(accuracyRadius);

  const isBadBot = identificationEvent?.bot === 'bad';

  const identificationSignals: TableCellData[][] = [
    [
      { content: 'Browser' },
      {
        content: (
          <JsonLink propertyName='browser_details' elementOrder='first'>
            {formatNameWithVersion(
              identificationEvent?.browser_details?.browser_name,
              identificationEvent?.browser_details?.browser_full_version,
            )}
          </JsonLink>
        ),

        className: tableStyles.neutral,
      },
    ],
    [
      { content: 'Operating System' },
      {
        content: (
          <JsonLink propertyName='browser_details' elementOrder='first'>
            {formatNameWithVersion(
              identificationEvent?.browser_details?.os,
              identificationEvent?.browser_details?.os_version,
            )}
          </JsonLink>
        ),
        className: tableStyles.neutral,
      },
    ],
    [
      { content: 'IP Address' },
      {
        content: (
          <span className={styles.ipAddress}>
            <JsonLink propertyName='ip_address' elementOrder='first'>
              {`${identificationEvent?.ip_address}`}
            </JsonLink>
          </span>
        ),
        className: tableStyles.neutral,
      },
    ],
    [
      {
        content: <DocsLink href='https://dev.fingerprint.com/docs/useful-timestamps'>Last Seen</DocsLink>,
      },
      {
        content: identificationData?.last_seen_at ? (
          <JsonLink propertyName='last_seen_at' elementOrder='first'>
            {timeAgoLabel(new Date(identificationData.last_seen_at).toISOString())}
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
          <DocsLink
            href='https://dev.fingerprint.com/docs/identification-accuracy-and-confidence#confidence-score'
            key='confidence'
          >
            Confidence Score
          </DocsLink>,
        ],
      },
      {
        content: identificationData?.confidence?.score ? (
          <JsonLink propertyName='confidence' elementOrder='first'>
            {String(Math.trunc(identificationData.confidence.score * 100) / 100)}
          </JsonLink>
        ) : (
          'Not available'
        ),
        className:
          identificationData?.confidence?.score && identificationData.confidence.score >= 0.7
            ? tableStyles.green
            : tableStyles.red,
      },
    ],
  ];

  const suspectScore = identificationEvent?.suspect_score;
  const ipVelocity = identificationEvent?.velocity?.distinct_ip?.['24_hours'];
  const linkedIdVelocity = identificationEvent?.velocity?.distinct_linked_id?.['24_hours'];
  const firstCellHeight = '95px';

  const smartSignals: TableCellData[][] = [
    [
      {
        content: (
          <>
            <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#ip-geolocation'>
              Geolocation
            </DocsLink>
            <div className={styles.locationText}>
              <JsonLink propertyName='ip_info' arrowPosition='inline'>
                {getLocationName(ipLocation)}
              </JsonLink>
            </div>
          </>
        ),
      },
      {
        content: (
          <>
            {/* Do not show Map to bots, avoid needless MapBox API calls */}
            {latitude && longitude && !isBadBot && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <Map
                  key={[latitude, longitude].toString()}
                  position={[latitude, longitude]}
                  zoom={zoom}
                  height={firstCellHeight}
                />
              </motion.div>
            )}
          </>
        ),
        className: tableStyles.noPadding,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#browser-incognito-detection'>
            Incognito Mode
          </DocsLink>
        ),
      },
      {
        content: (
          <JsonLink propertyName='incognito'>
            {identificationEvent?.incognito ? 'You are incognito 🕶' : 'Not detected'}
          </JsonLink>
        ),
        className: identificationEvent?.incognito ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#browser-bot-detection' key='bot'>
            Bot
          </DocsLink>,
        ],
      },
      {
        content: <JsonLink propertyName='bot'>{botDetectionResult({ event: identificationEvent })}</JsonLink>,
        className: isBadBot ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#vpn-detection-for-browsers'
            key='vpn'
          >
            VPN
          </DocsLink>,
        ],
      },
      {
        content: <JsonLink propertyName='vpn'>{vpnDetectionResult({ event: identificationEvent })}</JsonLink>,
        className: identificationEvent?.vpn === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#browser-tamper-detection'
            key='tamper'
          >
            Browser Tampering
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='tampering'>
            {identificationEvent?.tampering === true ? 'Yes 🖥️🔧' : 'Not detected'}
          </JsonLink>
        ),

        className: identificationEvent?.tampering === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#developer-tools-detection'
            key='devtools'
          >
            Developer Tools
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='developer_tools'>
            {identificationEvent?.developer_tools === true ? 'Yes 🔧' : 'Not detected'}
          </JsonLink>
        ),
        className: identificationEvent?.developer_tools === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#virtual-machine-detection'>
            Virtual Machine
          </DocsLink>
        ),
      },
      {
        content: (
          <JsonLink propertyName='virtual_machine'>
            {identificationEvent?.virtual_machine === true ? 'Yes ☁️💻' : 'Not detected'}
          </JsonLink>
        ),

        className: identificationEvent?.virtual_machine === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#privacy-focused-settings'>
            Privacy Settings
          </DocsLink>
        ),
      },
      {
        content: (
          <JsonLink propertyName='privacy_settings'>
            {identificationEvent?.privacy_settings === true ? 'Yes 🙈💻' : 'Not detected'}
          </JsonLink>
        ),
        className: identificationEvent?.privacy_settings === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#ip-blocklist-matching'
            key='blocklist'
          >
            IP Blocklist
          </DocsLink>,
        ],
      },
      {
        content: <JsonLink propertyName='ip_blocklist'>{ipBlocklistResult({ event: identificationEvent })}</JsonLink>,
        className:
          identificationEvent?.ip_blocklist?.attack_source ||
          identificationEvent?.ip_blocklist?.email_spam ||
          identificationEvent?.ip_blocklist?.tor_node
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#proxy-detection'
            key='proxy-detection'
          >
            Proxy Detection
          </DocsLink>,
        ],
      },
      {
        content: <JsonLink propertyName='proxy'>{proxyDetectionResult({ event: identificationEvent })}</JsonLink>,
        className: identificationEvent?.proxy === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#high-activity-device'
            key='high-activity'
          >
            High-Activity Device
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='high_activity_device'>
            {identificationEvent?.high_activity_device === true ? 'Yes 🔥' : 'Not detected'}
          </JsonLink>
        ),

        className: identificationEvent?.high_activity_device === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#device-rarity-detection'
            key='rare-device'
          >
            Rare Device
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='rare_device'>
            {identificationEvent?.rare_device === true ? 'Yes 💎' : 'Not detected'}
          </JsonLink>
        ),

        className: identificationEvent?.rare_device === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#velocity-signals' key='velocity '>
            Velocity Signals
          </DocsLink>,
        ],
      },
      {
        content: (
          <JsonLink propertyName='velocity'>
            {(ipVelocity || linkedIdVelocity) === undefined
              ? 'Not available'
              : `${[
                  ipVelocity && pluralize(ipVelocity, 'IP'),
                  linkedIdVelocity && pluralize(linkedIdVelocity, 'Linked ID'),
                ]
                  .filter(Boolean)
                  .join(', ')} in the past 24 hours`}
          </JsonLink>
        ),
        className:
          (ipVelocity || linkedIdVelocity) === undefined
            ? tableStyles.neutral
            : (ipVelocity && ipVelocity > 1) || (linkedIdVelocity && linkedIdVelocity > 3)
              ? tableStyles.red
              : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#suspect-score' key='suspect-score'>
            Suspect Score
          </DocsLink>,
        ],
      },
      {
        content:
          suspectScore !== undefined ? (
            <JsonLink propertyName='suspect_score'>{String(suspectScore)}</JsonLink>
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
        content: (
          <DocsLink href='https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection'>
            Proximity Detection
          </DocsLink>
        ),
      },
      {
        content: (
          <ProximityDetectionResult
            event={identificationEvent}
            onLocationRequest={requestLocation}
            scrollToResult={Boolean(locationRequest)}
            isCollectingLocation={isCollectingLocation}
          />
        ),
        className: identificationEvent?.proximity ? tableStyles.green : tableStyles.neutral,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#raw-device-attributes' key='raw'>
            Raw Device Attributes
          </DocsLink>,
        ],
      },
      {
        content: <JsonLink propertyName='raw_device_attributes'>See the JSON below</JsonLink>,
        className: tableStyles.green,
      },
    ],
  ];

  const mobileSmartSignals: TableCellData[][] = [
    [
      {
        content: [
          <div key='mobile-apps' className={styles.mobileAppsTableCellContainer} style={{ minHeight: firstCellHeight }}>
            <div className={styles.mobileAppsTableCellTitle}>Try our demo for mobile devices</div>
            <div className={styles.mobileAppsTableCellIcons}>
              <Link
                href='https://play.google.com/store/apps/details?id=com.fingerprintjs.android.fpjs_pro_demo'
                target='_blank'
              >
                <Image src={GooglePlaySvg} alt='Google Play' />
              </Link>
              <Link href='https://apps.apple.com/us/app/fingerprint-pro/id1644105278' target='_blank'>
                <Image src={AppStoreSvg} alt='App Store' />
              </Link>
            </div>
          </div>,
        ],
        colSpan: 2,
        className: `${tableStyles.noPadding} ${tableStyles.neutral}`,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#frida-detection' key='frida'>
            App is instrumented by Frida
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#factory-reset-detection' key='reset'>
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
            href='https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection'
            key='mobile-proximity'
          >
            Proximity Detection (Mobile)
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#geolocation-spoofing-detection'
            key='spoof'
          >
            Location Spoofing
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#vpn-detection-for-mobile-devices'
            key='mobile-vpn'
          >
            VPN (Mobile)
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#mitm-attack-detection' key='mitm'>
            Man-in-the-middle attack
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#tampered-request-detection-for-mobile-apps'
            key='tampered-request'
          >
            Tampered Request
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#active-call-detection'
            key='active-call'
          >
            Active Call Detection
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#developer-tools-detection-for-mobile-devices'
            key='mobile-developer-tools'
          >
            Developer Tools (Mobile)
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-reference#cloned-app-detection' key='cloned'>
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
            href='https://dev.fingerprint.com/docs/smart-signals-reference#android-emulator-detection'
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
            href='https://dev.fingerprint.com/docs/smart-signals-reference#rooted-device-detection'
            key='tamper'
          >
            Rooted Device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-reference#jailbroken-device-detection'
            key='jailbroken'
          >
            Jailbroken device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.iosOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://docs.fingerprint.com/docs/smart-signals-reference#ios-simulator-detection'
            key='ios-simulator'
          >
            iOS Simulator
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.iosOnly, className: tableStyles.neutral },
    ],
  ];

  return (
    <LayoutUI>
      <Container size='large' className={styles.hero}>
        <h1>
          <span>Fingerprint Pro</span> Playground
        </h1>
        <p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>
      </Container>
      <Container size='large'>
        <div className={styles.runningIntelligence}>
          {!identificationData ? (
            <h2>
              Running Device Intelligence<span className={styles.blink}>_</span>
            </h2>
          ) : (
            <RefreshButton
              loading={isLoadingAgentResponse || isPendingServerResponse || isCollectingLocation}
              getAgentData={getAgentData}
              className={styles.reloadButton}
            />
          )}
        </div>
      </Container>
      {requestError && identificationEvent && requestError !== dismissedError && (
        <Container size='large'>
          <Alert severity='error' className={styles.errorAlert} onClose={() => setDismissedError(requestError)}>
            {formatRequestError(agentError, serverError)}
          </Alert>
        </Container>
      )}
      <>
        <Container size='large'>
          <div className={styles.tablesContainer}>
            {identificationData ? (
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
                    <h2 className={styles.visitorId}>{identificationData.visitor_id}</h2>
                  </div>

                  <SignalTable data={identificationSignals} />
                </MyCollapsibleContent>
              </MyCollapsible>
            ) : (
              // Spacer element to push footer down when no data is ready
              <div style={{ height: '800px' }} />
            )}
            {identificationEvent ? (
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
        {identificationEvent ? (
          <>
            <Container size='large' className={styles.isSection}>
              <h2 className={styles.sectionTitle}>How to use this demo</h2>
              <HowToUseThisPlayground />
            </Container>
            <Container size='large' className={classnames(styles.isSection, styles.jsonSection)}>
              <div className={styles.jsonContainer}>
                {agentResponse && (
                  <div>
                    <h4 className={styles.jsonTitle}>
                      JavaScript Agent Response {isLoadingAgentResponse && <Spinner size={16} />}
                    </h4>
                    <CollapsibleJsonViewer dataTestId={TEST_IDS.playground.agentResponseJSON} json={agentResponse} />
                  </div>
                )}
                <div>
                  <h4 className={styles.jsonTitle}>
                    Server API Response {isPendingServerResponse && <Spinner size={16} />}
                  </h4>
                  <CollapsibleJsonViewer
                    dataTestId={TEST_IDS.playground.serverResponseJSON}
                    json={identificationEvent}
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
                {
                  title: 'Android Playground app',
                  url: 'https://play.google.com/store/apps/details?id=com.fingerprintjs.android.fpjs_pro_demo',
                  type: 'Demo app',
                },
                {
                  title: 'iOS Playground app',
                  url: 'https://apps.apple.com/us/app/fingerprint-pro/id1644105278',
                  type: 'Demo app',
                },
              ]}
            />
          </>
        ) : null}
      </>
    </LayoutUI>
  );
}
