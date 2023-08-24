import { sequelize } from '../server';
import * as Sequelize from 'sequelize';

// Defines model for article view
export const ArticleView = sequelize.define('article_view', {
  visitorId: {
    type: Sequelize.STRING,
  },
  articleId: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

ArticleView.sync({ force: false });
