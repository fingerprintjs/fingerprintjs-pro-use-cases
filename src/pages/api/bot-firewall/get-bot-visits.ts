import { NextApiRequest, NextApiResponse } from 'next';
import { BotVisit, getBotVisits } from '../../../server/botd-firewall/botVisitDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse<BotVisit[]>) {
  try {
    const limit = Number(req.query.limit);
    const botVisits = await getBotVisits(limit);
    res.status(200).json(botVisits);
  } catch (error) {
    console.error(error);
    res.statusMessage = `Something went wrong ${error}`;
    return res.status(500).end();
  }
}
