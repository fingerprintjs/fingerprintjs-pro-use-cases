import { useQuery } from 'react-query';
import { apiRequest } from '../api';
import { useVisitorData } from '../../use-visitor-data';
import { ArticleResponse } from '../../../pages/api/paywall/article/[id]';

async function getArticle(articleId, fpData) {
  return apiRequest(`/api/paywall/article/${articleId}`, fpData);
}

export const GET_ARTICLE_QUERY = 'GET_ARTICLE_QUERY';

export function useGetArticle(articleId) {
  const visitorDataQuery = useVisitorData({ extendedResult: false });

  return useQuery<ArticleResponse>([GET_ARTICLE_QUERY, articleId], () => getArticle(articleId, visitorDataQuery.data), {
    enabled: Boolean(visitorDataQuery.data),
  });
}
