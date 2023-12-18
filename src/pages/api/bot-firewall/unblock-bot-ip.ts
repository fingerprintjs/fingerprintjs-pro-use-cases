import { NextApiRequest, NextApiResponse } from 'next';
import { deleteBlockedIp } from '../../../server/botd-firewall/saveBlockedIp';
import { syncCloudflareBotFirewallRule } from '../../../server/botd-firewall/updateFirewallRule';

export default async function blockIp(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body = req.body;
    if (!body) {
      return new Response(null, { status: 400 });
    }

    await deleteBlockedIp(body.ip);
    await syncCloudflareBotFirewallRule();
    return res.send({ status: 200 });
  } else {
    return res.send({ status: 405 });
  }
}
