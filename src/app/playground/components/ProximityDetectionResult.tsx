/**
 * Proximity detection result for the Playground smart signals table.
 * - On web, the JS agent collects proximity only if the user granted the browser location permission.
 * - The Playground does not ask for location on page load, the user opts in with a button.
 * - Once we have a location, we identify again with a fresh agent, see `Playground`.
 *   Its location read is quick then, because the browser just got a location for us.
 * - The agent does not wait for location, it sends as soon as its other signals are ready.
 *   So the event can miss location even with permission granted.
 *   Seen in Safari on page load, where the agent's first location read can also time out.
 *   We then get a location and identify once more automatically:
 *   - With a fresh agent, if the event came from the agent started on page load.
 *   - With the same agent, if we started it, its location read is done by then. Starting another agent
 *     removes iframes, and in Firefox removing any iframe drops a temporary ("Allow once") permission,
 *     so the new agent's location read could prompt again.
 *   If the event still misses location, the user can try again with a button.
 * - Server API omits `proximity` when location was not available.
 * https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection
 */
import { Event } from '@fingerprint/node-sdk';
import { useEffect, useRef, useState } from 'react';
import { TEST_IDS } from '../../../client/testIDs';
import { JsonLink } from './ArrowLinks';
import styles from '../playground.module.scss';

// Same options the JS agent uses
const AGENT_LOCATION_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };

// `unsupported`: browser has no Permissions API (older Safari), we cannot know the state without prompting
type LocationPermission = PermissionState | 'unsupported';

export function ProximityDetectionResult({
  event,
  startLocationAgent,
  identify,
}: {
  event: Event | undefined;
  startLocationAgent: () => void;
  identify: () => Promise<unknown>;
}) {
  const [permission, setPermission] = useState<LocationPermission>();
  const [locationError, setLocationError] = useState<string>();
  // The event shown when we asked for location, we are collecting until a new event replaces it
  const [collectingSince, setCollectingSince] = useState<Event>();
  const hasRetried = useRef(false);
  const hasFreshAgent = useRef(false);

  // Reading the permission state does not prompt the user
  useEffect(() => {
    if (!('permissions' in navigator)) {
      setPermission('unsupported');
      return;
    }
    let status: PermissionStatus | undefined;
    let cancelled = false;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      })
      .catch(() => !cancelled && setPermission('unsupported'));
    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, []);

  const requestLocation = (onLocation: () => Promise<unknown>) => {
    setLocationError(undefined);
    setCollectingSince(event);
    // Shows the browser permission prompt if needed
    navigator.geolocation.getCurrentPosition(
      () => {
        // Do not rely on `onchange` to learn about the grant
        setPermission('granted');
        // Playground shows the identification error, stop collecting so the user can try again
        onLocation().catch(() => setCollectingSince(undefined));
      },
      (error) => {
        setCollectingSince(undefined);
        if (error.code === error.PERMISSION_DENIED) {
          // Without the Permissions API we cannot tell a dismiss from a deny, assume denied
          if (!('permissions' in navigator)) {
            setPermission('denied');
            return;
          }
          // Dismissing the prompt also gives PERMISSION_DENIED, but the state stays `prompt`, so read it again
          navigator.permissions
            .query({ name: 'geolocation' })
            .then((result) => setPermission(result.state))
            .catch(() => setPermission('denied'));
        } else {
          setLocationError(`Location not available: ${error.message}.`);
        }
      },
      AGENT_LOCATION_OPTIONS,
    );
  };

  const identifyWithFreshAgent = () => {
    hasFreshAgent.current = true;
    startLocationAgent();
    return identify();
  };

  const isCollecting = collectingSince !== undefined && collectingSince === event;

  // The agent missed location, retry once automatically
  useEffect(() => {
    if (!event || event.proximity || permission !== 'granted') return;
    if (isCollecting || locationError || hasRetried.current) return;
    hasRetried.current = true;
    requestLocation(hasFreshAgent.current ? identify : identifyWithFreshAgent);
  });

  const renderResult = () => {
    if (!event) return null;
    const proximity = event.proximity;
    if (proximity) {
      return (
        <JsonLink propertyName='proximity'>
          {`Zone ${proximity.id}, ${proximity.precision_radius} m radius, confidence ${proximity.confidence}`}
        </JsonLink>
      );
    }
    if (isCollecting) return 'Collecting location...';
    const tryAgain = (
      <button className={styles.inlineLinkButton} onClick={() => requestLocation(identifyWithFreshAgent)}>
        Try again
      </button>
    );
    // The OS can fail to get a location now and then, e.g. a cold fix times out
    if (locationError) {
      return (
        <>
          {locationError} {tryAgain}
        </>
      );
    }
    if (permission === 'denied') return 'Location denied. Allow it in browser settings and reload.';
    if (permission === 'granted') {
      return <>Location not collected. {tryAgain}</>;
    }
    if (permission === 'prompt' || permission === 'unsupported') {
      return (
        <>
          Location required.{' '}
          <button
            className={styles.inlineLinkButton}
            data-testid={TEST_IDS.playground.grantLocationButton}
            onClick={() => requestLocation(identifyWithFreshAgent)}
          >
            Grant permission
          </button>
        </>
      );
    }
    return null;
  };

  return renderResult();
}
