import { NextApiRequest, NextApiResponse } from 'next';
import { BotIp, BotVisitDbModel } from '../../../server/botd-firewall/saveBotVisit';

export default async function getBotVisits(req: NextApiRequest, res: NextApiResponse<BotIp[]>) {
  const botIps = await BotVisitDbModel.findAll({ order: [['timestamp', 'DESC']] });
  res.status(200).json(botIps);
}
