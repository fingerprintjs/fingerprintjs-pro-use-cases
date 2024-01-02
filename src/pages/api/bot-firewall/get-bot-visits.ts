import { NextApiRequest, NextApiResponse } from 'next';
import { BotVisit, getBotVisits } from '../../../server/botd-firewall/botVisitDatabase';

export default async function handler(_req: NextApiRequest, res: NextApiResponse<BotVisit[]>) {
  res.status(200).json(await getBotVisits());
}
