import { Event } from '@fingerprint/node-sdk';
import { EventResponseIpInfoV4Geolocation } from './types';

export const UNKNOWN_LOCATION = 'Unknown';
export function getLocationName(ipLocation?: EventResponseIpInfoV4Geolocation, includeSubdivision = true) {
  const addressParts: string[] = [];
  if (!ipLocation) {
    return UNKNOWN_LOCATION;
  }
  const { city_name, country_name, subdivisions, accuracy_radius } = ipLocation;
  if (city_name && accuracy_radius && accuracy_radius <= 50) {
    addressParts.push(city_name);
  }

  if (subdivisions?.[0]?.name && accuracy_radius && accuracy_radius <= 100 && includeSubdivision) {
    addressParts.push(subdivisions[0].name);
  }

  if (country_name) {
    addressParts.push(country_name);
  }

  if (addressParts.length === 0) {
    return UNKNOWN_LOCATION;
  }

  return addressParts.join(', ');
}

export const getIpLocation = (eventResponse?: Event): EventResponseIpInfoV4Geolocation | undefined => {
  return eventResponse?.ip_info?.v4?.geolocation;
};

// Courtesy of https://dev.to/jorik/country-code-to-flag-emoji-a21
export const getFlagEmoji = (countryCode?: string) => {
  if (!countryCode) {
    return '';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const getZoomLevel = (accuracyRadius?: number) => {
  if (!accuracyRadius || accuracyRadius > 500) {
    // Continent level zoon
    return 2;
  }
  if (accuracyRadius > 100) {
    // Country level zoom
    return 5;
  }
  // City level zoom
  return 10;
};
