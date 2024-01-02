import { BlockedIpDbModel, getBlockedIps } from '../src/server/botd-firewall/blockedIpsDatabase';
import { Op } from 'sequelize';
import { buildFirewallRules, updateFirewallRuleset } from '../src/server/botd-firewall/updateFirewallRule';
import { schedule } from 'node-cron';
import { HOUR_MS } from '../src/shared/timeUtils';
import 'dotenv/config';

/**
 * In production, run this file in conjunction with the production web server like:
 * yarn start:with-cron-jobs
 */

// Every 5 minutes
schedule('*/5 * * * *', () => {
  deleteOldIpBlocks();
});

const IP_BLOCK_TIME_TO_LIVE_MS = HOUR_MS;

async function deleteOldIpBlocks() {
  try {
    // Remove expired IP blocks
    const deletedCount = await BlockedIpDbModel.destroy({
      where: {
        timestamp: {
          [Op.lt]: new Date(Date.now() - IP_BLOCK_TIME_TO_LIVE_MS).toISOString(),
        },
      },
    });

    console.log(`Deleted ${deletedCount} expired blocked IPs from the database.`);

    if (deletedCount > 0) {
      // Construct updated firewall rules from the blocked IP database and apply them to the Cloudflare application
      const blockedIps = await getBlockedIps();
      const newRules = await buildFirewallRules(blockedIps);
      await updateFirewallRuleset(newRules);
      console.log(`Updated Cloudflare firewall.`);
    }
  } catch (error) {
    console.log(`Error deleting old blocked IPs:  ${error}`);
  }
}
