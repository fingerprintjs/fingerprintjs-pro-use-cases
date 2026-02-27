import { UserCartItemAttributes, UserCartItemDbModel } from '../../database';
import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';
import { NextRequest, NextResponse } from 'next/server';

export type RemoveCartItemPayload = {
  eventId: string;
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
  const { eventId, itemId } = (await req.json()) as RemoveCartItemPayload;

  const fingerprintResult = await getAndValidateFingerprintResult({
    eventId,
    req,
    options: { disableFreshnessCheck: true },
  });
  const visitorId = fingerprintResult.okay ? fingerprintResult.data.identification?.visitor_id : null;

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
