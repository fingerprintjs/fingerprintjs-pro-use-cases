/**
 * Proximity detection result for the Playground smart signals table.
 * - On web, the JS agent collects proximity only if the user granted the browser location permission.
 * - The Playground does not ask for location on page load, the user opts in with a button.
 * - Once granted, we reload the page so the new event includes `proximity`.
 *   - The agent reads location only when it loads, calling `getData()` again on the same page does not collect it.
 *   - The agent does not wait for location, it sends as soon as its other signals are ready (~160 ms on a fast device).
 *     If location was slower than that, the user can reload again with a button.
 * - Server API omits `proximity` when location was not available.
 * https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection
 */
import { Event } from '@fingerprint/node-sdk';
import { useEffect, useRef, useState } from 'react';
import Button from '../../../client/components/Button/Button';
import { TEST_IDS } from '../../../client/testIDs';
import { JsonLink } from './ArrowLinks';
import styles from '../playground.module.scss';

// Set right before our reload, so the reloaded page knows to check the result and scroll to it
const PROXIMITY_RELOAD_KEY = 'playgroundProximityReload';

// Same options the JS agent uses, so the browser has a fresh fix ready when the agent asks after the reload
const AGENT_LOCATION_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };

// `unsupported`: browser has no Permissions API (older Safari), we cannot know the state without prompting
type LocationPermission = PermissionState | 'unsupported';

export function ProximityDetectionResult({ event }: { event: Event | undefined }) {
  const [permission, setPermission] = useState<LocationPermission>();
  const [locationError, setLocationError] = useState<string>();
  const [isReloading, setIsReloading] = useState(false);
  const [isLocationTooSlow, setIsLocationTooSlow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // After our reload: scroll to the result, Playground disables scroll restoration so we do it ourselves
  useEffect(() => {
    if (!event || !sessionStorage.getItem(PROXIMITY_RELOAD_KEY)) return;
    sessionStorage.removeItem(PROXIMITY_RELOAD_KEY);
    setIsLocationTooSlow(!event.proximity);
    containerRef.current?.scrollIntoView({ block: 'center' });
  }, [event]);

  const reloadToCollectLocation = () => {
    setIsReloading(true);
    sessionStorage.setItem(PROXIMITY_RELOAD_KEY, 'true');
    window.location.reload();
  };

  const requestLocation = () =>
    // Shows the browser permission prompt
    navigator.geolocation.getCurrentPosition(
      reloadToCollectLocation,
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          // Dismissing the prompt also gives PERMISSION_DENIED, but the state stays `prompt`, so read it again
          navigator.permissions
            .query({ name: 'geolocation' })
            .then((result) => setPermission(result.state))
            .catch(() => setPermission('denied'));
        } else {
          setLocationError(`Location not available: ${error.message}`);
        }
      },
      AGENT_LOCATION_OPTIONS,
    );

  const renderResult = () => {
    const proximity = event?.proximity;
    if (proximity) {
      return (
        <JsonLink propertyName='proximity'>
          {`Zone ${proximity.id}, ${proximity.precision_radius} m radius, confidence ${proximity.confidence}`}
        </JsonLink>
      );
    }
    if (isReloading) return 'Reloading the page to collect location...';
    if (locationError) return locationError;
    if (isLocationTooSlow) {
      return (
        <div className={styles.proximityAction}>
          Location was too slow
          <Button size='small' variant='primary' outlined onClick={reloadToCollectLocation}>
            Try again
          </Button>
        </div>
      );
    }
    if (permission === 'denied') return 'Location permission denied in browser settings';
    if (permission === 'granted') return 'Not available';
    if (permission === 'prompt' || permission === 'unsupported') {
      return (
        <div className={styles.proximityAction}>
          Requires location permission
          <Button
            size='small'
            variant='primary'
            outlined
            data-testid={TEST_IDS.playground.grantLocationButton}
            onClick={requestLocation}
          >
            Grant
          </Button>
        </div>
      );
    }
    return null;
  };

  return <div ref={containerRef}>{renderResult()}</div>;
}
