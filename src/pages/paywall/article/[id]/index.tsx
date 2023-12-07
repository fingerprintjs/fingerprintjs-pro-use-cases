import { useRouter } from 'next/router';
import { Skeleton, SkeletonTypeMap } from '@mui/material';
import { UseCaseWrapper } from '../../../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CustomPageProps } from '../../../_app';
import { USE_CASES } from '../../../../client/components/common/content';
import BackArrow from '../../../../client/img/arrowLeft.svg';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../paywall.module.scss';
import Alert from '../../../../client/components/common/Alert/Alert';
import { ARTICLES } from '../../../../server/paywall/articles';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useQuery } from 'react-query';
import { ArticleResponse } from '../../../api/paywall/article/[id]';
import { TEST_IDS } from '../../../../client/testIDs';
import { ArticleGrid, Byline } from '../../../../client/components/paywall/ArticleGrid';
import { PAYWALL_COPY } from '../../../../server/paywall/paywallCopy';

function ArticleSkeleton({ animation = false }: { animation?: SkeletonTypeMap['props']['animation'] }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);
  return <>{skeletons}</>;
}

export default function Article({ embed }: CustomPageProps) {
  const router = useRouter();
  const articleId = router.query.id;

  const { getData: getVisitorData } = useVisitorData({
    ignoreCache: true,
  });

  const { data: articleData } = useQuery<ArticleResponse>(['GET_ARTICLE_QUERY', articleId], async () => {
    const { requestId, visitorId } = await getVisitorData();
    return await (
      await fetch(`/api/paywall/article/${articleId}`, {
        method: 'POST',
        body: JSON.stringify({ requestId, visitorId }),
      })
    ).json();
  });

  const { article, remainingViews } = articleData?.data ?? {};
  const returnUrl = `/paywall${embed ? '/embed' : ''}`;
  const relatedArticles = ARTICLES.filter((article) => article.id !== articleId).slice(0, 4);

  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none', padding: 0 }}>
      <div className={styles.articleContainer}>
        <div className={styles.buckButton} data-testid={TEST_IDS.paywall.goBack}>
          <Link href={returnUrl}>
            <Image src={BackArrow} alt="" className={styles.backArrow} />
            Back to articles
          </Link>
        </div>
        {!articleData && <ArticleSkeleton animation="wave" />}
        {articleData && articleData.message && articleData.severity !== 'success' && (
          <Alert severity={articleData.severity}>{articleData.message}</Alert>
        )}
        {articleData && articleData.severity === 'success' && remainingViews !== undefined && (
          <Alert severity="warning">
            {remainingViews > 0 ? PAYWALL_COPY.nArticlesRemaining(remainingViews) : PAYWALL_COPY.lastArticle}
          </Alert>
        )}
        {article && (
          <div className={styles.article} data-testid={TEST_IDS.paywall.articleContent}>
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
