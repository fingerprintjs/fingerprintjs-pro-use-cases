import { useQuery } from 'react-query';

const getArticles = () => fetch('/api/paywall/get-articles').then((res) => res.json());

export const ARTICLES_QUERY = 'ARTICLES_QUERY';

export function useArticles() {
  return useQuery(ARTICLES_QUERY, getArticles);
}
