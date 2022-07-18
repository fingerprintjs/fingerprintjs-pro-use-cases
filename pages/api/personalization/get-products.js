import { Product, UserSearchHistory } from './database';
import { sequelize } from '../../../shared/server';
import { Op } from 'sequelize';
import { personalizationEndpoint } from './personalization-endpoint';

const coffeeAdjectives = ['Smooth', 'Medium', 'Strong', 'Extra strong', 'Decaf'];

function getRandomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function getRandomCoffeeImage() {
  const response = await fetch('https://source.unsplash.com/random/?coffee&w=320');

  return response.url;
}

async function seedProducts() {
  await Promise.all(
    Array.from({ length: 15 }).map(async () => {
      const coffee = getRandomArrayElement(coffeeAdjectives);

      return Product.create({
        price: Math.floor(Math.random() * 100),
        name: `${coffee} coffee`,
        image: await getRandomCoffeeImage(),
        tags: [coffee],
        timestamp: new Date().getTime(),
      });
    })
  );

  await sequelize.sync();
}

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

export default personalizationEndpoint(async (req, res, { usePersonalizedData, visitorId }) => {
  const { query } = JSON.parse(req.body);

  let productsCount = await Product.count();

  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(query);

  if (query && usePersonalizedData) {
    await persistSearchPhrase(query.trim(), visitorId);
  }

  return res.status(200).json({
    data: products,
    size: products.length,
  });
});
