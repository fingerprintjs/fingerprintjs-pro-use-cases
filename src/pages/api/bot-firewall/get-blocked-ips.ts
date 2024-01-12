import { NextApiRequest, NextApiResponse } from 'next';
import { getBlockedIps } from '../../../server/botd-firewall/blockedIpsDatabase';

export default async function handler(_req: NextApiRequest, res: NextApiResponse<string[]>) {
  try {
    const blockedIps = await getBlockedIps();
    res.status(200).json(blockedIps);
  } catch (error) {
    console.error(error);
    res.statusMessage = `Something went wrong ${error}`;
    return res.status(500).end();
  }
}
