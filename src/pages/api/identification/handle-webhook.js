import { initIdentification, Visit } from '../../../server/identification/database';
import { extractSocketServer } from '../../../server/socket';
import { decorateWebhookVisits } from '../../../server/identification/decorate-visits';

export default function handler(req, res) {
  handle(req).catch(console.error);

  return res.status(200).send();
}

async function handle(req) {
  await initIdentification();

  const visit = req.body;

  if (!visit || !visit.visitorId) {
    console.error('Missing visit or visitorId', JSON.stringify(req.body, null, 2));
    return;
  }

  const result = await saveVisit(visit, req);

  if (result) {
    emitVisitEvent(result, req);
  }
}

function resolveLinkedId(visit) {
  if (visit.linkedId) {
    return visit.linkedId;
  }

  // Fallback if for some reason linkedId is missing in visit event
  if (visit.url) {
    try {
      const url = new URL(visit.url);
      const linkedId = url.searchParams.get('linkedId');

      if (linkedId) {
        return linkedId;
      }
    } catch {
      // Nothing here
    }
  }

  return null;
}

async function saveVisit(visit) {
  const linkedId = resolveLinkedId(visit);

  const existingVisit = await Visit.findOne({
    where: {
      visitorId: visit.visitorId,
      linkedId,
    },
  });

  if (existingVisit) {
    const visits = JSON.parse(existingVisit.visits);
    visits.push(visit);

    existingVisit.visits = JSON.stringify(visits);

    await existingVisit.save();

    return existingVisit;
  }

  return Visit.create({
    visitorId: visit.visitorId,
    visits: JSON.stringify([visit]),
    linkedId,
  });
}

function emitVisitEvent(visit, req) {
  const visits = visit.visits ? JSON.parse(visit.visits) : [];

  const socket = extractSocketServer(req);

  if (!socket) {
    return;
  }

  socket.emit('visit', {
    ...visit.toJSON(),
    visits: visits,
    ...decorateWebhookVisits(visits),
  });
}
