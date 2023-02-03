import { ensurePostRequest } from '../../../server/server';
import { uniqArray } from '../../../shared/utils/array';
import { initPresentationDemo, Visit } from '../../../server/presentation-demo/database';

export default async function handler(req, res) {
  await initPresentationDemo();
  ensurePostRequest(req, res);

  try {
    const { visitorId, linkedId } = JSON.parse(req.body);

    const rawVisit = await Visit.findOne({
      where: {
        visitorId,
        linkedId: linkedId ?? null,
      },
    });

    const visits = rawVisit ? JSON.parse(rawVisit.visits) : [];

    return res.status(200).json({
      visitorId,
      visits,
      ...decorateData(visits),
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: error.message });
  }
}

/**
 * @param visits {import('@fingerprintjs/fingerprintjs-pro-server-api').VisitorsResponse.visits}
 * */
function decorateData(visits) {
  return {
    incognitoSessionsCount: visits.filter((visit) => visit.incognito).length,
    ipAddresses: uniqArray(visits.map((visit) => visit.ip)).length,
    locations: uniqArray(visits.map((visit) => `${visit.ipLocation.latitude}-${visit.ipLocation.longitude}`)).length,
  };
}
