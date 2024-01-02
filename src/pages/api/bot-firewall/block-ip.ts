import { NextApiRequest, NextApiResponse } from 'next';
import { deleteBlockedIp, saveBlockedIp } from '../../../server/botd-firewall/blockedIpsDatabase';
import { syncFirewallRuleset } from '../../../server/botd-firewall/cloudflareApiHelper';
import { FingerprintJsServerApiClient, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { ALLOWED_REQUEST_TIMESTAMP_DIFF_MS, BACKEND_REGION, SERVER_API_KEY } from '../../../server/const';
import { ensurePostRequest } from '../../../server/server';
import { isRequestIdFormatValid, originIsAllowed, visitIpMatchesRequestIp } from '../../../server/checks';
import { isIP } from 'is-ip';
import { EventResponseIdentification } from '../../../shared/types';

export type BlockIpPayload = {
  ip: string;
  blocked: boolean;
  requestId: string;
};

export type BlockIpResponse = {
  result: 'success' | 'error';
  message: string;
  ip?: string;
  blocked?: boolean;
};

export default async function blockIp(req: NextApiRequest, res: NextApiResponse<BlockIpResponse>) {
  // This API route accepts only POST requests.
  if (!ensurePostRequest(req, res)) {
    return;
  }

  // Validate block/unblock request
  const { ip, blocked, requestId } = req.body as BlockIpPayload;
  const { okay, message } = await validateBlockIpRequest(requestId, ip, req);
  if (!okay) {
    return res.status(403).json({ result: 'error', message });
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
    return res.status(200).json({ result: 'success', message: 'OK', ip, blocked });
  } catch (error) {
    console.log(error);
    // Catch unexpected errors and return 500 to the client
    return res.status(500).json({ result: 'error', message: 'Internal server error.' });
  }
}

type ValidationResult = {
  okay: boolean;
  message: string;
};

// For this demo, we want to only enable visitors to block their own IP, not other people's IPs, to not interfere with their demo experience.
// In the actual scenario, only your authenticated admins could block bot IPs (or they would be blocked automatically) so this check would not be necessary.
const validateBlockIpRequest = async (
  requestId: string,
  ip: string,
  req: NextApiRequest,
): Promise<ValidationResult> => {
  if (!isRequestIdFormatValid(requestId)) {
    return { okay: false, message: 'Invalid request ID format.' };
  }

  if (!isIP(ip)) {
    return { okay: false, message: 'Invalid IP address.' };
  }

  let identification: EventResponseIdentification;
  try {
    const client = new FingerprintJsServerApiClient({ region: BACKEND_REGION, apiKey: SERVER_API_KEY });
    const eventResponse = await client.getEvent(requestId);
    identification = eventResponse.products?.identification?.data;
  } catch (error) {
    console.log(error);
    // Throw a specific error if the request ID is not found
    if (isEventError(error) && error.status === 404) {
      return { okay: false, message: 'Request ID not found, potential spoofing attack.' };
    } else {
      // Handle other errors
      return { okay: false, message: String(error) };
    }
  }

  if (!identification) {
    return { okay: false, message: 'Identification data not found, potential spoofing attack.' };
  }

  if (!visitIpMatchesRequestIp(identification?.ip, req) || ip !== identification?.ip) {
    return { okay: false, message: "Visitor's IP does not match blocked IP." };
  }

  if (!originIsAllowed(identification.url, req)) {
    return { okay: false, message: 'Visit origin does not match request origin.' };
  }

  if (Date.now() - Number(new Date(identification.time)) > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return { okay: false, message: 'Old visit, potential replay attack.' };
  }

  return { okay: true, message: 'All good' };
};
