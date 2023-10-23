import { sequelize } from '../server';
import * as Sequelize from 'sequelize';

interface Product
  extends Sequelize.Model<Sequelize.InferAttributes<Product>, Sequelize.InferCreationAttributes<Product>> {
  price: number;
  name: string;
  image: string;
  timestamp: string;
  tags: string[];
}

// Defines db model for product.
export const Product = sequelize.define<Product>('product', {
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

interface UserPreferencesModel
  extends Sequelize.Model<
    Sequelize.InferAttributes<UserPreferencesModel>,
    Sequelize.InferCreationAttributes<UserPreferencesModel>
  > {
  visitorId: string;
  hasDarkMode: boolean;
  timestamp: Date;
}

// Defines db model for user preferences.
export const UserPreferences = sequelize.define<UserPreferencesModel>('user_data', {
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

// Defines db model for search history.
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

interface UserCartItemModel
  extends Sequelize.Model<
    Sequelize.InferAttributes<UserCartItemModel>,
    Sequelize.InferCreationAttributes<UserCartItemModel>
  > {
  visitorId: string;
  count: number;
  timestamp: Date;
}

export type UserCartItem = {
  id: number;
  visitorId: string;
  count: number;
  timestamp: Date;
  product: Product;
  productId: number;
};

// Defines db model for cart item.
export const UserCartItem = sequelize.define<UserCartItemModel>('user_cart_item', {
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

// Setup relations
Product.hasMany(UserCartItem);
UserCartItem.belongsTo(Product);

let didInit = false;

const productModels = [Product, UserCartItem, UserPreferences, UserCartItem, UserSearchHistory];

export async function initProducts() {
  if (didInit) {
    return;
  }

  didInit = true;

  await Promise.all(productModels.map((model) => model.sync({ force: false }))).catch(console.error);
}
