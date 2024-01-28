import { NextApiRequest, NextApiResponse } from 'next';
import { deleteBlockedIp, saveBlockedIp } from '../../../server/botd-firewall/blockedIpsDatabase';
import { syncFirewallRuleset } from '../../../server/botd-firewall/cloudflareApiHelper';
import { isValidPostRequest } from '../../../server/server';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isIP } from 'is-ip';
import { ValidationResult } from '../../../shared/types';
import { Severity } from '../../../server/checkResult';

export type BlockIpPayload = {
  ip: string;
  blocked: boolean;
  requestId: string;
};

export type BlockIpResponse = {
  severity: Severity;
  message: string;
  data?: {
    ip: string;
    blocked: boolean;
  };
};

export default async function blockIp(req: NextApiRequest, res: NextApiResponse<BlockIpResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  // Validate block/unblock request
  const { ip, blocked, requestId } = req.body as BlockIpPayload;
  const validationResult = await isValidBlockIpRequest(requestId, ip, req);
  if (!validationResult.okay) {
    return res.status(403).json({ severity: 'error', message: validationResult.error });
  }

  try {
    // Save or remove blocked IP from database
    if (blocked) {
      await saveBlockedIp(ip);
    } else {
      await deleteBlockedIp(ip);
    }

    // Construct updated firewall rules from the blocked IP database and apply them to your Cloudflare application
    await syncFirewallRuleset();

    // Return success
    return res.status(200).json({ severity: 'success', message: 'OK', data: { ip, blocked } });
  } catch (error) {
    console.error(error);
    // Catch unexpected errors and return 500 to the client
    return res.status(500).json({ severity: 'error', message: 'Internal server error.' });
  }
}

// For this demo, we want to only enable visitors to block their own IP, not other people's IPs, to not interfere with their demo experience.
// In the actual scenario, only your authenticated admins could block bot IPs (or they would be blocked automatically) so this check would not be necessary.
const isValidBlockIpRequest = async (requestId: string, ip: string, req: NextApiRequest): Promise<ValidationResult> => {
  // Validate IP address
  if (!isIP(ip)) {
    return { okay: false, error: 'Invalid IP address.' };
  }

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  return await getAndValidateFingerprintResult(requestId, req);
};
