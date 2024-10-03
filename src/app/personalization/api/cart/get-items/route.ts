import { UserCartItem, ProductDbModel, UserCartItemDbModel } from '../../../../../server/personalization/database';
import { Op } from 'sequelize';
import { NextRequest, NextResponse } from 'next/server';
import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';

export type GetCartItemsPayload = {
  requestId: string;
};

export type GetCartItemsResponse = {
  severity: Severity;
  message?: string;
  data?: UserCartItem[];
  size?: number;
};

// Returns cart items for the given visitorId
export async function POST(req: NextRequest): Promise<NextResponse<GetCartItemsResponse>> {
  const { requestId } = (await req.json()) as GetCartItemsPayload;

  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3, disableFreshnessCheck: true },
  });
  const visitorId = fingerprintResult.okay ? fingerprintResult.data.products.identification?.data?.visitorId : null;

  if (!visitorId) {
    return NextResponse.json({ data: [], size: 0, severity: 'success', message: 'Visitor ID not available' });
  }

  const cartItems = (await UserCartItemDbModel.findAll({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    order: [['timestamp', 'DESC']],
    include: ProductDbModel,
    // To-do: Clean this up later, find out how to represent DB associations in TypeScript correctly
  })) as unknown as UserCartItem[];

  return NextResponse.json({
    severity: 'success',
    data: cartItems,
    size: cartItems.length,
  });
}
