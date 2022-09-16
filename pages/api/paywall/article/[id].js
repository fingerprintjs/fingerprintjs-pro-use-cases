import { articles } from '../../../../api/paywall/articles';
import { paywallEndpoint } from '../../../../api/paywall/paywall-endpoint';
import { countViewedArticles, saveArticleView } from '../../../../api/paywall/article-views';
import { ARTICLE_VIEW_LIMIT } from '../../../../shared/paywall/constants';

/**
 * Fetches article by its ID. Supports paywall logic, which means that we keep track of how many articles were viewed by a given user.
 * If a user has exceeded limit of articles that he can view for free, we return an error.
 */
export default paywallEndpoint(async (req, res, visitorData) => {
  const { id } = req.query;

  const article = articles.find((article) => article.id === id);

  if (!article) {
    return res.status(404).json({
      data: null,
    });
  }

  await saveArticleView(id, visitorData.visitorId);

  const viewCount = await countViewedArticles(visitorData.visitorId);

  return res.status(200).json({
    data: {
      article,
      remainingViews: ARTICLE_VIEW_LIMIT - viewCount,
      viewedArticles: viewCount,
    },
  });
});
