import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ARTICLES, ArticleData } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';
import Image from 'next/image';
import { FunctionComponent } from 'react';
import styles from './paywall.module.scss';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { TEST_IDS } from '../../client/e2eTestIDs';

/**
 * Byline helper component
 */

const BylineDot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="3" height="4" viewBox="0 0 3 4" fill="none">
    <circle cx="1.5" cy="1.66016" r="1.5" fill="#434344" />
  </svg>
);

function calculateReadingTime(text: string[], wordsPerMinute = 200) {
  const words = text
    .join('')
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const readingTimeMins = Math.round(words.length / wordsPerMinute);
  return `${Math.max(readingTimeMins, 1)} min read`;
}

export const Byline = ({ article, includeReadingTime }: { article: ArticleData; includeReadingTime?: boolean }) => (
  <div className={styles.byline}>
    <Image src={article.author.avatar} className={styles.authorImage} alt={`Picture of ${article.author.name}`} />
    <div>{article.author.name}</div>
    <BylineDot />
    <div>{article.date}</div>
    {includeReadingTime && (
      <>
        <BylineDot />
        <div>{calculateReadingTime(article.content)}</div>
      </>
    )}
  </div>
);

/**
 * Article Card and Grid
 */
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
      data-test={TEST_IDS.paywall.articleCard}
    >
      <Image src={article.image} alt="" className={styles.articleCardImage} sizes="100vw" />
      <div className={styles.articleCardContent}>
        <Byline article={article} />
        <a href={link} key={article.id} className={styles.articleCardTitle}>
          {article.title}
        </a>
        <p className={styles.articleCardDescription}>{article.description}</p>
        <div className={styles.articleCardTags}>
          {article.tags.map((tag) => (
            <div key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ArticleGrid: FunctionComponent<{ articles: ArticleData[]; embed?: boolean }> = ({ articles, embed }) => {
  return (
    <div className={styles.articles}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} embed={embed} />
      ))}
    </div>
  );
};

/**
 * Main Paywall use case page with article listing
 */
export default function Paywall({ embed }: CustomPageProps) {
  const heroArticle = ARTICLES[0];
  const gridArticles = ARTICLES.slice(1);
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
      {heroArticle && <ArticleCard article={heroArticle} embed={embed} isHeroArticle />}
      {gridArticles && <ArticleGrid articles={gridArticles} embed={embed} />}
    </UseCaseWrapper>
  );
}
