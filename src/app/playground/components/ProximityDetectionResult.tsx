/**
 * Proximity detection result for the Playground smart signals table.
 * Asks for the browser location permission and identifies again to collect proximity.
 * https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection
 */
import { Event } from '@fingerprint/node-sdk';
import { RefObject, useEffect, useState } from 'react';
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
  hasLocationAgent,
  hasRetriedRef,
  identify,
  requestError,
}: {
  event: Event | undefined;
  startLocationAgent: () => void;
  hasLocationAgent: () => boolean;
  // Lives in `Playground`, collapsing the table unmounts this row
  hasRetriedRef: RefObject<boolean>;
  identify: () => Promise<unknown>;
  requestError: Error | null | undefined;
}) {
  const [permission, setPermission] = useState<LocationPermission>();
  const [locationError, setLocationError] = useState<string>();
  // The event shown when we asked for location, we are collecting until a new event replaces it
  const [eventToReplace, setEventToReplace] = useState<Event>();

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
    setEventToReplace(event);
    // Shows the browser permission prompt if needed
    navigator.geolocation.getCurrentPosition(
      () => {
        // Do not rely on `onchange` to learn about the grant
        setPermission('granted');
        // Playground shows the identification error, stop collecting so the user can try again
        onLocation().catch(() => setEventToReplace(undefined));
      },
      (error) => {
        setEventToReplace(undefined);
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
    startLocationAgent();
    return identify();
  };

  // Playground shows the error and keeps the previous event, stop collecting so the user can try again
  useEffect(() => {
    if (requestError) setEventToReplace(undefined);
  }, [requestError]);

  const isCollecting = eventToReplace !== undefined && eventToReplace === event;

  // The agent does not wait for location, it sends as soon as its other signals are ready.
  // So the event can miss location even with permission granted, e.g. in Safari on page load,
  // where the agent's first location read can also time out. Get a location and identify once more:
  // - With a fresh agent, if the event came from the agent started on page load.
  // - With the same agent, if we started it, its location read is done by then.
  // "Try again" always starts a fresh agent, because an agent whose location read failed
  // does not reliably read again.
  useEffect(() => {
    if (!event || event.proximity || permission !== 'granted') return;
    if (isCollecting || locationError || requestError || hasRetriedRef.current) return;
    hasRetriedRef.current = true;
    // Starting another agent removes iframes, and in Firefox removing any iframe drops a temporary
    // ("Allow once") permission, so the new agent's location read could prompt again.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=2086598
    requestLocation(hasLocationAgent() ? identify : identifyWithFreshAgent);
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
