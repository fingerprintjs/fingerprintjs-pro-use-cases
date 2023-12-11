import { Product, ProductDbModel, UserSearchHistoryDbModel } from '../../../server/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../server/personalization/personalization-endpoint';
import { seedProducts } from '../../../server/personalization/seed';

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

export type GetProductResponse = {
  data: {
    products: Product[];
    querySaved: boolean;
  };
  size: number;
};

// Returns products from database, supports simple search query.
// If search query is provided and visitorId is valid it is saved in database.
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  let querySaved = false;

  const { query } = JSON.parse(req.body);

  const productsCount = await ProductDbModel.count();

  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(query);

  if (query && usePersonalizedData && visitorId) {
    await persistSearchPhrase(query.trim(), visitorId);

    querySaved = true;
  }

  const response: GetProductResponse = {
    data: {
      products,
      querySaved,
    },
    size: products.length,
  };

  return res.status(200).json(response);
});
