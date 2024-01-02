import { NextApiRequest, NextApiResponse } from 'next';
import { getBlockedIps } from '../../../server/botd-firewall/blockedIpsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse<string[]>) {
  const blockedIps = await getBlockedIps();
  res.status(200).json(blockedIps);
}
