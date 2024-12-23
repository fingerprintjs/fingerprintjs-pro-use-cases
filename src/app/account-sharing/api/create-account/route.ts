import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { UserDbModel } from '../database';
import { hashString } from '../../../../server/server-utils';

export type CreateAccountPayload = {
  requestId: string;
  username: string;
  password: string;
};

export type CreateAccountResponse = {
  message: string;
  severity: 'success' | 'error';
};

export async function POST(req: Request): Promise<NextResponse<CreateAccountResponse>> {
  const { requestId, username, password } = (await req.json()) as CreateAccountPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: 'Visitor ID not found.', severity: 'error' }, { status: 403 });
  }

  UserDbModel.create({
    username,
    passwordHash: hashString(password),
  });

  // If the provided credentials are correct and we recognize the browser, we log the user in
  return NextResponse.json({ message: 'Account created successfully', severity: 'success' });
}
