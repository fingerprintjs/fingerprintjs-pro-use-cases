import { sequelize } from '../../shared/server';
import * as Sequelize from 'sequelize';

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

export async function initPaywall() {
  await ArticleView.sync({ force: false });
}
