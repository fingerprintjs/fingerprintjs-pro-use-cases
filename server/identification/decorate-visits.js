import { uniqArray } from '../../shared/utils/array';

/**
 * @param visits {import('@fingerprintjs/fingerprintjs-pro-server-api').VisitWebhook[]}
 * */
export function decorateWebhookVisits(visits) {
  return {
    incognitoSessionsCount: visits.filter((visit) => visit.incognito).length,
    ipAddresses: uniqArray(visits.map((visit) => visit.ip)).length,
    locations: uniqArray(visits.map((visit) => `${visit.ipLocation.latitude}-${visit.ipLocation.longitude}`)).length,
  };
}
