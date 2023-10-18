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

function ArticleSkeleton({ animation = false }: { animation?: SkeletonTypeMap['props']['animation'] }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);
  return <>{skeletons}</>;
}

function calculateReadingTime(text, wordsPerMinute = 200) {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const readingTimeMins = words.length / wordsPerMinute;
  return `${Math.max(readingTimeMins, 1)} min read`;
}

export const BylineDot = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="3" height="4" viewBox="0 0 3 4" fill="none">
    <circle cx="1.5" cy="1.66016" r="1.5" fill="#434344" />
  </svg>
);

export default function Article({ embed }: CustomPageProps) {
  const router = useRouter();

  const { data, isLoading } = useGetArticle(router.query.id);

  const { article, remainingViews } = data?.data ?? {};

  const returnUrl = `/paywall${embed ? '/embed' : ''}`;

  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
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
          <div className={styles.byline}>
            <Image
              src={article.author.avatar}
              className={styles.authorImage}
              alt={`Picture of ${article.author.name}`}
            />
            <div>{article.author.name}</div>
            <BylineDot />
            <div>{article.date}</div>
            <BylineDot />
            <div>{calculateReadingTime(article.content)}</div>
          </div>
          <h2 className={styles.articleTitle}>{article.title}</h2>
          {article.content}
        </div>
      )}
      {article?.content}
    </UseCaseWrapper>
  );
}
