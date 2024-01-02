import { NextApiRequest, NextApiResponse } from 'next';
import { BotVisit, getBotVisits } from '../../../server/botd-firewall/botVisitDatabase';

export default async function handler(_req: NextApiRequest, res: NextApiResponse<BotVisit[]>) {
  try {
    const blockedIps = await getBotVisits();
    res.status(200).json(blockedIps);
  } catch (error) {
    console.log(error);
    res.statusMessage = `Something went wrong ${error}`;
    return res.status(500).end();
  }
}
