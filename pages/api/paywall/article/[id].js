import { articles } from '../../../../api/paywall/articles';
import { paywallEndpoint } from '../../../../api/paywall/paywall-endpoint';
import { ARTICLE_VIEW_LIMIT, countViewedArticles, saveArticleView } from '../../../../api/paywall/article-views';

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
