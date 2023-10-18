import { ARTICLES, ArticleData } from '../../../../server/paywall/articles';
import { paywallEndpoint } from '../../../../server/paywall/paywall-endpoint';
import { countViewedArticles, saveArticleView } from '../../../../server/paywall/article-views';
import { ARTICLE_VIEW_LIMIT } from '../../../../shared/paywall/constants';
import { CheckResultObject } from '../../../../server/checkResult';

export type ArticleResponse = CheckResultObject<{
  article: ArticleData;
  remainingViews: number;
  viewedArticles: number;
}>;

/**
 * Fetches article by its ID. Supports paywall logic, which means that we keep track of how many articles were viewed by a given user.
 * If a user has exceeded limit of articles that he can view for free, we return an error.
 */
export default paywallEndpoint(async (req, res, visitorData) => {
  const { id } = req.query;

  const article = ARTICLES.find((article) => article.id === id);

  if (!article) {
    const response: ArticleResponse = { severity: 'error', message: 'Article not found', type: 'ArticleNotFound' };
    return res.status(404).json(response);
  }

  await saveArticleView(id, visitorData.visitorId);
  const viewCount = await countViewedArticles(visitorData.visitorId);

  const response: ArticleResponse = {
    severity: 'success',
    type: 'ArticleViewed',
    message: 'Article viewed',
    data: {
      article,
      remainingViews: ARTICLE_VIEW_LIMIT - viewCount,
      viewedArticles: viewCount,
    },
  };
  return res.status(200).json(response);
});
