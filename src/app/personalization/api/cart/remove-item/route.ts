import { UserCartItemAttributes, UserCartItemDbModel } from '../../database';
import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';
import { NextRequest, NextResponse } from 'next/server';

export type RemoveCartItemPayload = {
  requestId: string;
  itemId: number;
};

export type RemoveCartItemResponse = {
  severity: Severity;
  message?: string;
  data?: UserCartItemAttributes;
  removed?: boolean;
};

// Removes an item from cart for given visitorId
export async function POST(req: NextRequest): Promise<NextResponse<RemoveCartItemResponse>> {
  const { requestId, itemId } = (await req.json()) as RemoveCartItemPayload;

  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3, disableFreshnessCheck: true },
  });
  const visitorId = fingerprintResult.okay ? fingerprintResult.data.products.identification?.data?.visitorId : null;

  if (!visitorId) {
    return NextResponse.json(
      { severity: 'error', message: 'Visitor ID not available', removed: false },
      { status: 400 },
    );
  }

  const item = await UserCartItemDbModel.findOne({
    where: { id: itemId },
  });

  if (!item) {
    return NextResponse.json({ severity: 'error', message: 'Item not found', removed: false }, { status: 400 });
  }

  item.count--;
  let removed = false;

  if (item.count <= 0) {
    removed = true;
    await item.destroy();
  } else {
    await item.save();
  }

  return NextResponse.json({
    severity: 'success',
    data: item,
    removed,
  });
}
