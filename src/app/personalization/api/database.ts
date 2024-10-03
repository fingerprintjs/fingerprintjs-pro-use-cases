import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Attributes,
  ForeignKey,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../../../server/sequelize';

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

export type UserSearchTerm = Attributes<UserSearchHistoryAttributes>;

export interface UserCartItemAttributes
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

const productModels = [ProductDbModel, UserCartItemDbModel, UserCartItemDbModel, UserSearchHistoryDbModel];

// Create DB tables
productModels.map((model) => model.sync({ force: false }));
