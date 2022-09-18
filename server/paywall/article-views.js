import { Op } from 'sequelize';
import { ArticleView } from './database';
import { getTodayDateRange } from '../../shared/utils/date';
import { ARTICLE_VIEW_LIMIT } from '../../shared/paywall/constants';
import { CheckResult, checkResultType, messageSeverity } from '../server';

/**
 * Saves article view into the database. If it already exists, we update its timestamp.
 * */
export async function saveArticleView(articleId, visitorId) {
  const { timestampEnd, timestampStart } = getTodayDateRange();

  const [view, created] = await ArticleView.findOrCreate({
    where: {
      articleId: {
        [Op.eq]: articleId,
      },
      visitorId: {
        [Op.eq]: visitorId,
      },
      timestamp: {
        [Op.between]: [timestampStart, timestampEnd],
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

/**
 * Returns count of all articles that were viewed by given visitorId today.
 * */
export async function countViewedArticles(visitorId) {
  const { timestampEnd, timestampStart } = getTodayDateRange();

  return await ArticleView.count({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
      timestamp: {
        [Op.between]: [timestampStart, timestampEnd],
      },
    },
  });
}

/**
 * Checks if the given visitor has exceeded his daily limit of free article views.
 * */
export async function checkCountOfViewedArticles(visitorData, req) {
  const { timestampEnd, timestampStart } = getTodayDateRange();

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
        timestamp: {
          [Op.between]: [timestampStart, timestampEnd],
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
