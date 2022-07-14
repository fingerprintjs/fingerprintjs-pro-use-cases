import { sequelize } from '../../../shared/server';
import * as Sequelize from 'sequelize';

export const Product = sequelize.define('product', {
  price: {
    type: Sequelize.FLOAT,
  },
  name: {
    type: Sequelize.STRING,
  },
  image: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
  tags: {
    type: Sequelize.JSONB,
  },
});

export const UserPreferences = sequelize.define('user_data', {
  visitorId: {
    type: Sequelize.STRING,
  },
  hasDarkMode: {
    type: Sequelize.BOOLEAN,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

export const UserSearchHistory = sequelize.define('user_search_history', {
  visitorId: {
    type: Sequelize.STRING,
  },
  query: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

export const UserCartItem = sequelize.define('user_cart_item', {
  visitorId: {
    type: Sequelize.STRING,
  },
  count: {
    type: Sequelize.INTEGER,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

Product.belongsTo(UserCartItem);
UserCartItem.hasMany(Product);

// TODO Better way to sync DB before seeding
Promise.all([Product, UserCartItem, UserPreferences, UserCartItem].map((model) => model.sync({ force: false }))).catch(
  console.error
);
