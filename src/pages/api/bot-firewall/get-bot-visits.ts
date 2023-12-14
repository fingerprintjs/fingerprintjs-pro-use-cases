import { NextApiRequest, NextApiResponse } from 'next';
import { BotIp, BotVisitDbModel } from '../../../server/botd-firewall/saveBotVisit';

export default async function getBotIps(req: NextApiRequest, res: NextApiResponse<BotIp[]>) {
  const botIps = await BotVisitDbModel.findAll();
  res.status(200).json(botIps);
}
