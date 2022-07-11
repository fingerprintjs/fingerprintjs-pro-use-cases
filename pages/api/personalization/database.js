import { sequelize } from '../../../shared/server';
import * as Sequelize from 'sequelize';

export const Product = sequelize.define('product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4, // Generates a UUID V4
    primaryKey: true,
  },
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
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4, // Generates a UUID V4
    primaryKey: true,
  },
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
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4, // Generates a UUID V4
    primaryKey: true,
  },
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
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4, // Generates a UUID V4
    primaryKey: true,
  },
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
