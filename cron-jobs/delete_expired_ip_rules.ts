import { BlockedIpDbModel } from '../src/server/botd-firewall/blockedIpsDatabase';
import { Op } from 'sequelize';
import {
  buildFirewallRules,
  getBlockedIps,
  updateFirewallRuleset,
} from '../src/server/botd-firewall/updateFirewallRule';
import { schedule } from 'node-cron';

// Read environment variables
import 'dotenv/config';

// In production, run this in conjunction with the production web server like:
// yarn start:with-cron-jobs
schedule('*/5 * * * * *', () => {
  deleteOldIpBlocks();
});

// const IP_BLOCK_TIME_TO_LIVE = HOUR_MS;
const IP_BLOCK_TIME_TO_LIVE_MS = 1000 * 60;

async function deleteOldIpBlocks() {
  try {
    // Remove IP blocks older than 1 hour
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
