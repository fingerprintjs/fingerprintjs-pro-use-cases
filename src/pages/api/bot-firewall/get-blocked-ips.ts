import { NextApiRequest, NextApiResponse } from 'next';
import { BlockedIp, BlockedIpDbModel } from '../../../server/botd-firewall/saveBlockedIp';

export default async function handler(req: NextApiRequest, res: NextApiResponse<BlockedIp[]>) {
  const blockedIps = await BlockedIpDbModel.findAll();
  res.status(200).json(blockedIps);
}
