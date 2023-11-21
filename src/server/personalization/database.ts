import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Attributes,
  ForeignKey,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../server';

interface ProductAttributes
  extends Model<InferAttributes<ProductAttributes>, InferCreationAttributes<ProductAttributes>> {
  id: CreationOptional<number>;
  price: number;
  name: string;
  image: string;
  timestamp: string;
  tags: string[];
}

// Defines db model for product.
export const ProductDbModel = sequelize.define<ProductAttributes>('product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  price: {
    type: DataTypes.FLOAT,
  },
  name: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  tags: {
    type: DataTypes.JSONB,
  },
});

export type Product = Attributes<ProductAttributes>;

interface UserPreferencesAttributes
  extends Model<InferAttributes<UserPreferencesAttributes>, InferCreationAttributes<UserPreferencesAttributes>> {
  visitorId: string;
  hasDarkMode: boolean;
  timestamp: Date;
}

// Defines db model for user preferences.
export const UserPreferencesDbModel = sequelize.define<UserPreferencesAttributes>('user_data', {
  visitorId: {
    type: DataTypes.STRING,
  },
  hasDarkMode: {
    type: DataTypes.BOOLEAN,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

interface UserSearchHistoryAttributes
  extends Model<InferAttributes<UserSearchHistoryAttributes>, InferCreationAttributes<UserSearchHistoryAttributes>> {
  visitorId: string;
  query: string;
  timestamp: number;
}

// Defines db model for search history.
export const UserSearchHistoryDbModel = sequelize.define<UserSearchHistoryAttributes>('user_search_history', {
  visitorId: {
    type: DataTypes.STRING,
  },
  query: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

interface UserCartItemAttributes
  extends Model<InferAttributes<UserCartItemAttributes>, InferCreationAttributes<UserCartItemAttributes>> {
  id: CreationOptional<number>;
  visitorId: string;
  count: number;
  timestamp: Date;
  productId: ForeignKey<number>;
}

// Defines db model for cart item.
export const UserCartItemDbModel = sequelize.define<UserCartItemAttributes>('user_cart_item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  visitorId: {
    type: DataTypes.STRING,
  },
  count: {
    type: DataTypes.INTEGER,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  productId: {
    type: DataTypes.INTEGER,
  },
});

export type UserCartItem = Attributes<UserCartItemAttributes> & { product: Product };

// Setup relations
ProductDbModel.hasMany(UserCartItemDbModel);
UserCartItemDbModel.belongsTo(ProductDbModel);

let didInit = false;

const productModels = [
  ProductDbModel,
  UserCartItemDbModel,
  UserPreferencesDbModel,
  UserCartItemDbModel,
  UserSearchHistoryDbModel,
];

export async function initProducts() {
  if (didInit) {
    return;
  }

  didInit = true;

  await Promise.all(productModels.map((model) => model.sync({ force: false }))).catch(console.error);
}
