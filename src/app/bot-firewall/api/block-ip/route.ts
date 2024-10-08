import { syncFirewallRuleset } from './cloudflareApiHelper';
import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { isIP } from 'is-ip';
import { ValidationResult } from '../../../../utils/types';
import { NextRequest, NextResponse } from 'next/server';
import { deleteBlockedIp, saveBlockedIp } from '../get-blocked-ips/blockedIpsDatabase';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest): Promise<NextResponse<BlockIpResponse>> {
  // Validate block/unblock request
  const { ip, blocked, requestId } = (await req.json()) as BlockIpPayload;
  const validationResult = await isValidBlockIpRequest(requestId, ip, req);
  if (!validationResult.okay) {
    return NextResponse.json({ severity: 'error', message: validationResult.error }, { status: 403 });
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
    return NextResponse.json({ severity: 'success', message: 'OK', data: { ip, blocked } }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Catch unexpected errors and return 500 to the client
    return NextResponse.json({ severity: 'error', message: 'Internal server error.' }, { status: 500 });
  }
}

// For this demo, we want to only enable visitors to block their own IP, not other people's IPs, to not interfere with their demo experience.
// In the actual scenario, only your authenticated admins could block bot IPs (or they would be blocked automatically) so this check would not be necessary.
const isValidBlockIpRequest = async (requestId: string, ip: string, req: Request): Promise<ValidationResult> => {
  // Validate IP address
  if (!isIP(ip)) {
    return { okay: false, error: 'Invalid IP address.' };
  }

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  return await getAndValidateFingerprintResult({ requestId, req, options: { minConfidenceScore: 0.5 } });
};
