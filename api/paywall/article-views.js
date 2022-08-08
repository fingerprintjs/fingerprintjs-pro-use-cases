import { Op } from 'sequelize';
import { ArticleView } from './database';
import { CheckResult, checkResultType, messageSeverity } from '../../shared/server';

export const ARTICLE_VIEW_LIMIT = 3;

export async function saveArticleView(articleId, visitorId) {
  const [view, created] = await ArticleView.findOrCreate({
    where: {
      articleId: {
        [Op.eq]: articleId,
      },
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
    defaults: {
      articleId,
      visitorId,
      timestamp: new Date(),
    },
  });

  if (!created) {
    view.timestamp = new Date();

    await view.save();
  }

  return view;
}

export async function countViewedArticles(visitorId) {
  return await ArticleView.count({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });
}

export async function checkCountOfViewedArticles(visitorData, req) {
  const [count, existingView] = await Promise.all([
    countViewedArticles(visitorData.visitorId),
    ArticleView.findOne({
      where: {
        visitorId: {
          [Op.eq]: visitorData.visitorId,
        },
        articleId: {
          [Op.eq]: req.query.id,
        },
      },
    }),
  ]);

  if (!existingView && count >= ARTICLE_VIEW_LIMIT) {
    return new CheckResult(
      'You have reached your daily view limit, purchase our membership plan to view unlimited articles.',
      messageSeverity.Error,
      checkResultType.ArticleViewLimitExceeded
    );
  }
}
