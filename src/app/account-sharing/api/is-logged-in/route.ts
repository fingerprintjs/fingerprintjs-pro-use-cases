import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { DeviceDbModel } from '../database';

export type IsLoggedInPayload = {
  requestId: string;
  username: string;
};

export type IsLoggedInResponse = {
  message: string;
  severity: 'success' | 'error';
};

export async function POST(req: Request): Promise<NextResponse<IsLoggedInResponse>> {
  const { username, requestId } = (await req.json()) as IsLoggedInPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    // We use the built-in React SDK caching to get user to the homepage faster, so we disable the freshness check
    // Alternatively, we could keep the check and disable caching with useVisitorData({ ignoreCache: true })
    options: { disableFreshnessCheck: true },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: 'Visitor ID not found.', severity: 'error' }, { status: 403 });
  }

  const isLoggedIn = await DeviceDbModel.findOne({ where: { username, visitorId } });
  if (!isLoggedIn) {
    return NextResponse.json({ message: 'You have been logged out', severity: 'error' }, { status: 401 });
  }

  // If the provided credentials are correct and we recognize the browser, we log the user in
  return NextResponse.json({ message: 'User is logged in', severity: 'success' });
}
