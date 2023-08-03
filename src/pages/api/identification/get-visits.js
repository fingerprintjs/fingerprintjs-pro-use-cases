import { initIdentification, Visit } from '../../../server/identification/database';
import { decorateWebhookVisits } from '../../../server/identification/decorate-visits';

export default async function handler(req, res) {
  await initIdentification();

  try {
    const { visitorId, linkedId } = req.query;

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
      ...decorateWebhookVisits(visits),
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: error.message });
  }
}
