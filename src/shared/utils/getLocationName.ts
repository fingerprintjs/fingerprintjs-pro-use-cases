import { EventResponseIpInfoV4Geolocation } from '../types';

export const UNKNOWN_LOCATION = 'Unknown';
export function getLocationName(ipLocation?: EventResponseIpInfoV4Geolocation) {
  const addressParts: string[] = [];
  if (!ipLocation) {
    return UNKNOWN_LOCATION;
  }
  const { city, country, subdivisions } = ipLocation;
  if (city?.name) {
    addressParts.push(city.name);
  }

  if (subdivisions?.[0]?.name) {
    addressParts.push(subdivisions[0].name);
  }

  if (country) {
    addressParts.push(country.name);
  }

  if (addressParts.length === 0) {
    return UNKNOWN_LOCATION;
  }

  return addressParts.join(', ');
}
