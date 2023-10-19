import { useRouter } from 'next/router';
import { Skeleton, SkeletonTypeMap } from '@mui/material';
import { useGetArticle } from '../../../../client/api/personalization/use-get-article';
import { UseCaseWrapper } from '../../../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CustomPageProps } from '../../../_app';
import { USE_CASES } from '../../../../client/components/common/content';
import LinkArrow from '../../../../client/img/externalLinkArrow.svg';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../paywall.module.scss';
import Alert from '../../../../client/components/common/Alert/Alert';
import { ArticleGrid, Byline } from '../..';
import { ARTICLES } from '../../../../server/paywall/articles';

function ArticleSkeleton({ animation = false }: { animation?: SkeletonTypeMap['props']['animation'] }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);
  return <>{skeletons}</>;
}

export default function Article({ embed }: CustomPageProps) {
  const router = useRouter();
  const { data } = useGetArticle(router.query.id);
  const { article, remainingViews } = data?.data ?? {};
  const returnUrl = `/paywall${embed ? '/embed' : ''}`;
  const relatedArticles = ARTICLES.filter((article) => article.id !== router.query.id).slice(0, 4);

  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none', padding: 0 }}>
      <div className={styles.articleContainer}>
        <div className={styles.buckButton}>
          <Link href={returnUrl}>
            <Image src={LinkArrow} alt="" className={styles.backArrow} />
            Back to articles
          </Link>
        </div>
        {!data && <ArticleSkeleton animation="wave" />}
        {data && data.message && data.severity !== 'success' && <Alert severity={data.severity}>{data.message}</Alert>}
        {data && data.severity === 'success' && (
          <Alert severity="warning">
            {remainingViews > 0
              ? `You have ${remainingViews} remaining free article views.`
              : 'This is your last free article today.'}
          </Alert>
        )}
        {article && (
          <div className={styles.article}>
            <Image src={article.image} alt={article.title} sizes="100vw" className={styles.articleImage} />
            <Byline article={article} includeReadingTime />
            <h2 className={styles.articleTitle}>{article.title}</h2>
            <div className={styles.articleContent}>
              {article.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
      {article && (
        <div className={styles.readMoreContainer}>
          <h3 className={styles.readMore}>More articles to read</h3>
          <ArticleGrid articles={relatedArticles} embed={embed} />
        </div>
      )}
    </UseCaseWrapper>
  );
}
