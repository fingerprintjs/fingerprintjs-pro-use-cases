import { Product } from './database';
import { sequelize } from '../../../shared/server';
import { Op } from 'sequelize';

const coffees = ['smooth', 'medium', 'strong', 'extra strong'];

function getRandomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function getRandomCoffeeImage() {
  const response = await fetch('https://source.unsplash.com/random/?coffee');

  return response.url;
}

async function seedProducts() {
  await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const coffee = getRandomArrayElement(coffees);

      return Product.create({
        price: Math.floor(Math.random() * 100),
        name: `${coffee} coffee`,
        image: await getRandomCoffeeImage(),
        tags: [coffee],
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

export default async function handler(req, res) {
  let productsCount = await Product.count();

  if (!productsCount) {
    await seedProducts();
  }

  const products = await searchProducts(req.query.query);

  return res.status(200).json({
    data: products,
    size: products.length,
  });
}
