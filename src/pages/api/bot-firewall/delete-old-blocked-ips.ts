import { NextApiRequest, NextApiResponse } from 'next';
import { BlockedIpDbModel } from '../../../server/botd-firewall/saveBlockedIp';
import { HOUR_MS } from '../../../shared/timeUtils';
import { Op } from 'sequelize';
import {
  buildFirewallRules,
  getBlockedIps,
  updateFirewallRuleset,
} from '../../../server/botd-firewall/updateFirewallRule';

const IP_BLOCK_TIME_TO_LIVE = HOUR_MS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request
    if (req.method !== 'DELETE' || req.body.key !== process.env.DELETE_OLD_BLOCKED_IPS_KEY) {
      throw new Error('Invalid request format or wrong key provided');
    }

    // Remove IP blocks older than 1 hour
    const deletedCount = await BlockedIpDbModel.destroy({
      where: {
        timestamp: {
          [Op.lt]: new Date(Date.now() - IP_BLOCK_TIME_TO_LIVE).toISOString(),
        },
      },
    });

    // Construct updated firewall rules from the blocked IP database and apply them to the Cloudflare application
    const blockedIps = await getBlockedIps();
    const newRules = await buildFirewallRules(blockedIps);
    await updateFirewallRuleset(newRules);

    const message = `Deleted ${deletedCount} expired blocked IPs and updated Cloudflare firewall`;
    console.log(message);
    return res.status(200).json({ result: 'success', message });
  } catch (error) {
    const message = `Error while deleting old blocked IPs:  ${error}`;
    console.log(message);
    return res.status(500).json({ result: 'error', message });
  }
}
