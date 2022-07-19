import { Product, UserSearchHistory } from '../../../api/personalization/database';
import { sequelize } from '../../../shared/server';
import { Op } from 'sequelize';
import { personalizationEndpoint } from '../../../api/personalization/personalization-endpoint';

const coffeeAdjectives = ['Smooth', 'Medium', 'Strong', 'Extra strong', 'Decaf'];

const coffeeImages = [
  'https://images.unsplash.com/photo-1519682577862-22b62b24e493?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-1.2.1&q=80&w=720',
  'https://images.unsplash.com/photo-1520790564652-5e2e07fc9454?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-1.2.1&q=80&w=720',
  'https://images.unsplash.com/photo-1562537238-971da66934df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-1.2.1&q=80&w=720',
  'https://images.unsplash.com/photo-1501612636467-ddc0346d843d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-1.2.1&q=80&w=720',
];

function getRandomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomCoffeeImage() {
  return getRandomArrayElement(coffeeImages);
}

async function seedProducts() {
  await Promise.all(
    Array.from({ length: 15 }).map(async () => {
      const coffee = getRandomArrayElement(coffeeAdjectives);

      return Product.create({
        price: Math.floor(Math.random() * 100),
        name: `${coffee} coffee`,
        image: getRandomCoffeeImage(),
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
