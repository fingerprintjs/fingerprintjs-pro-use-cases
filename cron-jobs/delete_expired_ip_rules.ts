import { Op } from 'sequelize';
import { syncFirewallRuleset } from '../src/app/bot-firewall/api/block-ip/cloudflareApiHelper';
import { schedule } from 'node-cron';
import 'dotenv/config';
import { ONE_HOUR_MS } from '../src/utils/timeUtils';
import { BlockedIpDbModel } from '../src/app/bot-firewall/api/get-blocked-ips/blockedIpsDatabase';

/**
 * In production, run this file in conjunction with the production web server like:
 * yarn start:with-cron-jobs
 */

// Every 5 minutes
schedule('*/5 * * * *', () => {
  deleteOldIpBlocks();
});

const IP_BLOCK_TIME_TO_LIVE_MS = ONE_HOUR_MS;

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
    console.error(`Error deleting old blocked IPs: ${error}`);
  }
}
