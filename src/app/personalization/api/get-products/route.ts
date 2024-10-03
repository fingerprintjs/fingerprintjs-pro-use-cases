import { Product, ProductDbModel, UserSearchHistoryDbModel } from '../../../../server/personalization/database';
import { Op } from 'sequelize';
import { seedProducts } from '../../../../server/personalization/seed';
import { NextRequest, NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';

function searchProducts(query: string) {
  if (!query) {
    return ProductDbModel.findAll();
  }

  return ProductDbModel.findAll({
    where: {
      name: {
        [Op.like]: `%${query}%`,
      },
    },
  });
}

// Persists search query for given visitorId
async function persistSearchPhrase(query: string, visitorId: string) {
  const existingHistory = await UserSearchHistoryDbModel.findOne({
    where: {
      query: {
        [Op.eq]: query,
      },
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });

  if (existingHistory) {
    existingHistory.timestamp = new Date().getTime();

    await existingHistory.save();

    return;
  }

  await UserSearchHistoryDbModel.create({
    visitorId,
    query,
    timestamp: new Date().getTime(),
  });
}

export type GetProductsResponse = {
  data: {
    products: Product[];
    querySaved: boolean;
  };
  size: number;
};

export type GetProductsPayload = {
  query: string;
  requestId: string;
};

// Returns products from database, supports simple search query.
// If search query is provided and visitorId is valid it is saved in database.
export async function POST(req: NextRequest): Promise<NextResponse<GetProductsResponse>> {
  let querySaved = false;

  const { query, requestId } = (await req.json()) as GetProductsPayload;

  const productsCount = await ProductDbModel.count();
  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(query);

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3 },
  });
  const visitorId = fingerprintResult.okay ? fingerprintResult.data.products.identification?.data?.visitorId : null;

  if (query && visitorId) {
    await persistSearchPhrase(query.trim(), visitorId);
    querySaved = true;
  }

  return NextResponse.json({
    data: { products, querySaved },
    size: products.length,
  });
}
