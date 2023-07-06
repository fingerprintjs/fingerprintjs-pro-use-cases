import { GetStaticProps } from 'next';
import Article from '.';
import { CustomPageProps } from '../../../_app';
import { ARTICLES } from '../../../../server/paywall/articles';

export default Article;

export const getStaticProps: GetStaticProps<CustomPageProps> = async () => {
  return {
    props: {
      embed: true,
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: ARTICLES.map((article) => ({ params: { id: article.id } })),
    fallback: 'blocking',
  };
};
