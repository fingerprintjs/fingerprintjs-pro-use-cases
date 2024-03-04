import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FunctionComponent } from 'react';
import { ArticleData } from '../../../server/paywall/articles';
import { TEST_IDS } from '../../testIDs';
import Image from 'next/image';
import styles from './articleGrid.module.scss';
import BylineDot from './dot.svg';

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
    <Image src={BylineDot} alt='' />
    <div>{article.date}</div>
    {includeReadingTime && (
      <>
        <Image src={BylineDot} alt='' />
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

export const ArticleCard: FunctionComponent<ArticleCardProps> = ({ article, embed, isHeroArticle }) => {
  const link = `/paywall/article/${article.id}${embed ? '/embed' : ''}`;
  const router = useRouter();
  return (
    <div
      className={classNames(styles.articleCard, isHeroArticle && styles.heroArticleCard)}
      onClick={() => router.push(link)}
      data-testid={TEST_IDS.paywall.articleCard}
    >
      <Image src={article.image} alt='' className={styles.articleCardImage} sizes='100vw' />
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
