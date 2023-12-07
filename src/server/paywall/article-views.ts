import { Op } from 'sequelize';
import { ArticleViewDbModel } from './database';
import { getTodayDateRange } from '../../shared/utils/date';
import { messageSeverity } from '../server';
import { CheckResult, checkResultType } from '../checkResult';
import { RuleCheck } from '../checks';
import { PAYWALL_COPY } from './paywallCopy';

export const ARTICLE_VIEW_LIMIT = 2;

/**
 * Saves article view into the database. If it already exists, we update its timestamp.
 * */
export async function saveArticleView(articleId: string, visitorId: string) {
  const { timestampEnd, timestampStart } = getTodayDateRange();

  const [view, created] = await ArticleViewDbModel.findOrCreate({
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
export async function countViewedArticles(visitorId: string) {
  const { timestampEnd, timestampStart } = getTodayDateRange();

  return await ArticleViewDbModel.count({
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
export const checkCountOfViewedArticles: RuleCheck = async (eventResponse, req) => {
  const { timestampEnd, timestampStart } = getTodayDateRange();

  const visitorId = eventResponse.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return new CheckResult('Could not find visitor ID', messageSeverity.Error, checkResultType.RequestIdMismatch);
  }

  const [count, existingView] = await Promise.all([
    countViewedArticles(visitorId),
    ArticleViewDbModel.findOne({
      where: {
        visitorId: {
          [Op.eq]: visitorId,
        },
        articleId: {
          [Op.eq]: req.query.id as string,
        },
        timestamp: {
          [Op.between]: [timestampStart, timestampEnd],
        },
      },
    }),
  ]);

  if (!existingView && count >= ARTICLE_VIEW_LIMIT) {
    return new CheckResult(PAYWALL_COPY.limitReached, messageSeverity.Error, checkResultType.ArticleViewLimitExceeded);
  }
};
