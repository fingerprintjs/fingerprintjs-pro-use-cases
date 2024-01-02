import { BlockedIpDbModel } from '../src/server/botd-firewall/blockedIpsDatabase';
import { Op } from 'sequelize';
import { syncFirewallRuleset } from '../src/server/botd-firewall/cloudflareApiHelper';
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

    /**
     * Construct updated firewall rules from the blocked IP database and apply them to the Cloudflare application.
     * Note: We do this even if no IPs were deleted:
     * A user might have blocked their IP but the database might have been cleared during site deployment right after,
     * potentially leaving the IP blocked beyond the desired TTL. Safer to sync the firewall ruleset every time.
     */
    await syncFirewallRuleset();
    console.log(`Updated Cloudflare firewall.`);
  } catch (error) {
    console.log(`Error deleting old blocked IPs: ${error}`);
  }
}
