import { Product } from './database';
import { sequelize } from '../server';

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

export async function seedProducts() {
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
    }),
  );

  await sequelize.sync();
}
