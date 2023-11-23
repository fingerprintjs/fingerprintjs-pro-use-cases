import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../server';

interface ArticleViewAttributes
  extends Model<InferAttributes<ArticleViewAttributes>, InferCreationAttributes<ArticleViewAttributes>> {
  visitorId: string;
  articleId: string;
  timestamp: Date;
}

export const ArticleViewDbModel = sequelize.define<ArticleViewAttributes>('article_view', {
  visitorId: {
    type: DataTypes.STRING,
  },
  articleId: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

ArticleViewDbModel.sync({ force: false });

export type ArticleView = Attributes<ArticleViewAttributes>;
