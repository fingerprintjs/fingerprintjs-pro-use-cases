import { IpLocation } from '@fingerprintjs/fingerprintjs-pro';

export const UNKNOWN_LOCATION = 'Unknown';
export function getLocationName(ipLocation?: IpLocation) {
  console.log(ipLocation);
  const addressParts: string[] = [];
  if (!ipLocation) {
    return UNKNOWN_LOCATION;
  }
  const { city, country, subdivisions } = ipLocation;
  if (city) {
    addressParts.push(city.name);
  }

  if (subdivisions?.length > 0) {
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
