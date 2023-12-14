import { NextApiRequest, NextApiResponse } from 'next';
import { BotIp, BotIpDbModel } from '../../../server/botd-firewall/saveBotIp';

export default async function getBotIps(req: NextApiRequest, res: NextApiResponse<BotIp[]>) {
  const botIps = await BotIpDbModel.findAll();
  res.status(200).json(botIps);
}
