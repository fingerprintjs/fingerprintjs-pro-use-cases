import { initIdentification, Visit } from '../../../server/identification/database';
import { decorateWebhookVisits } from '../../../server/identification/decorate-visits';

export default async function handler(req, res) {
  await initIdentification();

  try {
    const { linkedId } = req.query;

    const rawVisits = await Visit.findAll({
      where: {
        linkedId: linkedId ?? null,
      },
    });

    const visits = rawVisits.map((rawVisit) => {
      const visits = JSON.parse(rawVisit.visits);
      return {
        ...rawVisit.toJSON(),
        visits,
        ...decorateWebhookVisits(visits),
      };
    });

    return res.status(200).json(visits);
  } catch (error) {
    console.error(error);

    return res.status(400).json({ message: error.message });
  }
}
