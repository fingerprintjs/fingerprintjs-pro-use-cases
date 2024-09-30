import { NextRequest, NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { UserPreferencesDbModel } from '../../../../server/personalization/database';

type GetUserPreferencesPayload = { requestId: string };
type GetUserPreferencesResponse = { data?: any };

export async function POST(req: NextRequest): Promise<NextResponse<GetUserPreferencesResponse>> {
  const { requestId } = (await req.json()) as GetUserPreferencesPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3 },
  });

  const visitorId = fingerprintResult.okay ? fingerprintResult.data.products.identification?.data?.visitorId : null;
  if (!visitorId) {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  const result = await UserPreferencesDbModel.findOne({ where: { visitorId } });
  if (!result) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({
    data: result,
  });
}
