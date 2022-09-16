import { articles } from '../../../api/paywall/articles';

const SHORT_ARTICLE_CONTENT_LENGTH = 100;

/**
 * Returns articles with trimmed descriptions from the database.
 */
export default function getArticles(req, res) {
  const mappedArticles = articles.map((article) => ({
    ...article,
    content:
      article.content.length > SHORT_ARTICLE_CONTENT_LENGTH
        ? article.content.slice(0, SHORT_ARTICLE_CONTENT_LENGTH).concat('...')
        : article.content,
  }));

  return res.status(200).json({
    data: mappedArticles,
  });
}
