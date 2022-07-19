import { Product, UserSearchHistory } from '../../../api/personalization/database';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../api/personalization/personalization-endpoint';
import { seedProducts } from '../../../api/personalization/seed';

function searchProducts(query) {
  if (!query) {
    return Product.findAll();
  }

  return Product.findAll({
    where: {
      name: {
        [Op.like]: `%${query}%`,
      },
    },
  });
}

// Persists search query for given visitorId
async function persistSearchPhrase(query, visitorId) {
  const existingHistory = await UserSearchHistory.findOne({
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

  await UserSearchHistory.create({
    visitorId,
    query,
    timestamp: new Date().getTime(),
  });
}

// Returns products from database, supports simple search query.
// If search query is provided and visitorId is valid it is saved in database.
export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  let querySaved = false;

  const { query } = JSON.parse(req.body);

  let productsCount = await Product.count();

  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(query);

  if (query && usePersonalizedData) {
    await persistSearchPhrase(query.trim(), visitorId);

    querySaved = true;
  }

  return res.status(200).json({
    data: {
      products,
      querySaved,
    },
    size: products.length,
  });
});
