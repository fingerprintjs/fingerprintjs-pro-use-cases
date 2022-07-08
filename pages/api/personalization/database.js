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

Product.sync({ force: false });
