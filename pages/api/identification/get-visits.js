import { ensurePostRequest } from '../../../server/server';
import { fingerprintJsApiClient } from '../../../server/fingerprint-api';
import { uniqArray } from '../../../shared/utils/array';

export default async function handler(req, res) {
  ensurePostRequest(req, res);

  try {
    const { visitorId, linkedId } = JSON.parse(req.body);

    const filter = linkedId ? { linked_id: linkedId } : undefined;

    const visits = await fingerprintJsApiClient.getVisitorHistory(visitorId, filter);

    return res.status(200).json({
      ...visits,
      ...decorateData(visits),
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: error.message });
  }
}

/**
 * @param visits {import('@fingerprintjs/fingerprintjs-pro-server-api').VisitorsResponse}
 * */
function decorateData(visits) {
  return {
    incognitoSessionsCount: visits.visits.filter((visit) => visit.incognito).length,
    ipAddresses: uniqArray(visits.visits.map((visit) => visit.ip)).length,
    locations: uniqArray(visits.visits.map((visit) => `${visit.ipLocation.latitude}-${visit.ipLocation.longitude}`))
      .length,
  };
}
