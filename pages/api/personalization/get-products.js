import { initProducts, Product, UserSearchHistory } from './database';
import { areVisitorIdAndRequestIdValid, ensurePostRequest, getVisitorData, sequelize } from '../../../shared/server';
import { Op } from 'sequelize';

const coffees = ['smooth', 'medium', 'strong', 'extra strong'];

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
      const coffee = getRandomArrayElement(coffees);

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

export default async function handler(req, res) {
  if (!ensurePostRequest(req, res)) {
    return;
  }

  await initProducts();

  const { query, requestId, visitorId } = JSON.parse(req.body);

  let productsCount = await Product.count();

  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(query);

  if (query && areVisitorIdAndRequestIdValid(visitorId, requestId)) {
    const userData = await getVisitorData(visitorId, requestId);

    await persistSearchPhrase(query.trim(), userData.visitorId);
  }

  return res.status(200).json({
    data: products,
    size: products.length,
  });
}
