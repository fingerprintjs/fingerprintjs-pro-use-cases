/**
 * Request location before starting a fresh identification in the same document.
 * https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection
 */
import { Event } from '@fingerprint/node-sdk';
import { useEffect, useRef, useState } from 'react';
import { TEST_IDS } from '../../../client/testIDs';
import { JsonLink } from './ArrowLinks';
import styles from '../playground.module.scss';

// `unsupported`: browser has no Permissions API (older Safari), we cannot know the state without prompting
type LocationPermission = PermissionState | 'unsupported';

export function ProximityDetectionResult({
  event,
  onLocationRequest,
  scrollToResult,
  isCollectingLocation,
}: {
  event: Event | undefined;
  onLocationRequest: (onError: (error: GeolocationPositionError | Error) => void) => void;
  scrollToResult: boolean;
  isCollectingLocation: boolean;
}) {
  const [permission, setPermission] = useState<LocationPermission>();
  const [locationError, setLocationError] = useState<string>();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

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

  useEffect(() => {
    if (!event || !scrollToResult || hasScrolledRef.current) return;
    hasScrolledRef.current = true;
    containerRef.current?.scrollIntoView({ block: 'center' });
  }, [event, scrollToResult]);

  const requestLocation = () => {
    setLocationError(undefined);
    setIsRequestingLocation(true);
    onLocationRequest((error) => {
      setIsRequestingLocation(false);
      if ('code' in error && error.code === error.PERMISSION_DENIED) {
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
        setLocationError(`Location not available: ${error.message}`);
      }
    });
  };

  const renderResult = () => {
    const proximity = event?.proximity;
    if (proximity) {
      return (
        <JsonLink propertyName='proximity'>
          {`Zone ${proximity.id}, ${proximity.precision_radius} m radius, confidence ${proximity.confidence}`}
        </JsonLink>
      );
    }
    if (isRequestingLocation || isCollectingLocation) return 'Collecting location...';
    if (permission === 'denied') return 'Location denied. Allow it in browser settings and reload.';
    if (locationError || permission === 'granted' || scrollToResult) {
      return (
        <>
          {locationError ?? 'Location not collected.'}{' '}
          <button className={styles.inlineLinkButton} onClick={requestLocation}>
            Try again
          </button>
        </>
      );
    }
    if (permission === 'prompt' || permission === 'unsupported') {
      return (
        <>
          Location required.{' '}
          <button
            className={styles.inlineLinkButton}
            data-testid={TEST_IDS.playground.grantLocationButton}
            onClick={requestLocation}
          >
            Grant permission
          </button>
        </>
      );
    }
    return null;
  };

  return <div ref={containerRef}>{renderResult()}</div>;
}
