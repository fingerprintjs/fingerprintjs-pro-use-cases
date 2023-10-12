import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ARTICLES_SHORTENED, ArticleData } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';
import Image from 'next/image';
import { FunctionComponent } from 'react';
import styles from './paywall.module.scss';
import { useRouter } from 'next/router';
import classNames from 'classnames';

export async function getServerSideProps() {
  return {
    props: {
      articles: ARTICLES_SHORTENED,
    },
  };
}

type ArticleCardProps = {
  article: ArticleData;
  embed?: boolean;
  isHeroArticle?: boolean;
};
const ArticleCard: FunctionComponent<ArticleCardProps> = ({ article, embed, isHeroArticle }) => {
  const link = `/paywall/article/${article.id}${embed ? '/embed' : ''}`;
  const router = useRouter();
  return (
    <div
      className={classNames(styles.articleCard, isHeroArticle && styles.heroArticleCard)}
      onClick={() => router.push(link)}
    >
      <Image src={article.image} alt="" className={styles.articleCardImage} sizes="100vw" />
      <div className={styles.articleCardContent}>
        <div className={styles.byline}>
          <Image src={article.author.avatar} className={styles.authorImage} alt={`Picture of ${article.author.name}`} />
          <div>{article.author.name}</div>
          <svg xmlns="http://www.w3.org/2000/svg" width="3" height="4" viewBox="0 0 3 4" fill="none">
            <circle cx="1.5" cy="1.66016" r="1.5" fill="#434344" />
          </svg>
          <div>{article.date}</div>
        </div>
        <a href={link} key={article.id} className={styles.articleCardTitle}>
          {article.title}
        </a>
        <p className={styles.articleCardDescription}>{article.content}</p>
        <div className={styles.articleCardTags}>
          {article.tags.map((tag) => (
            <div key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

type PaywallProps = CustomPageProps & {
  articles: ArticleData[];
};

export default function Paywall({ articles, embed }: PaywallProps) {
  const heroArticle = articles[0];
  const gridArticles = articles.slice(1);
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
      {heroArticle && <ArticleCard article={heroArticle} embed={embed} isHeroArticle />}
      {gridArticles && (
        <div className={styles.articles}>
          {gridArticles.map((article) => (
            <ArticleCard key={article.id} article={article} embed={embed} />
          ))}
        </div>
      )}
    </UseCaseWrapper>
  );
}
