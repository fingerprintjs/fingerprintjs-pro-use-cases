import { NextResponse } from 'next/server';

import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { AccountDbModel } from './database';
import { hashString } from '../../../../server/server-utils';

export type CreateAccountPayload = {
  password: string;
  requestId: string;
  username: string;
};

export type CreateAccountResponse = {
  message: string;
  severity: Severity;
};

export async function POST(req: Request): Promise<NextResponse<CreateAccountResponse>> {
  const { username, password, requestId } = (await req.json()) as CreateAccountPayload;

  // Validate the input data from the request
  if (!username) {
    return NextResponse.json({ severity: 'error', message: '"username" is required.' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ severity: 'error', message: '"password" is required.' }, { status: 400 });
  }
  if (!requestId) {
    return NextResponse.json({ severity: 'error', message: '"requestId" is required.' }, { status: 400 });
  }

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  // Check if an account already exists for this visitorId
  const existingAccount = await AccountDbModel.findOne({ where: { visitorId } });
  if (existingAccount) {
    return NextResponse.json(
      { severity: 'error', message: 'An account has already been created by this device.' },
      { status: 409 },
    );
  }

  // If not, create a new account
  await AccountDbModel.create({
    visitorId,
    passwordHash: hashString(password),
    username,
    timestamp: new Date(),
  });

  return NextResponse.json({ severity: 'success', message: 'Account created.' }, { status: 200 });
}
