import { useRouter } from 'next/router';
import { Skeleton, SkeletonTypeMap } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useGetArticle } from '../../../../client/api/personalization/use-get-article';
import { UseCaseWrapper } from '../../../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CustomPageProps } from '../../../_app';
import { USE_CASES } from '../../../../client/components/common/content';

function ArticleSkeleton({ animation = false }: { animation?: SkeletonTypeMap['props']['animation'] }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);

  return <>{skeletons}</>;
}

export default function Article({ embed }: CustomPageProps) {
  const router = useRouter();

  const articleQuery = useGetArticle(router.query.id);

  const queryData = articleQuery.data;
  const data = queryData?.data;

  const returnUrl = `/paywall${embed ? '/embed' : ''}`;

  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed} contentSx={{ maxWidth: 'none' }}>
      {data?.article.content ?? <ArticleSkeleton animation={articleQuery.isLoading ? 'wave' : false} />}

      {queryData?.message && queryData?.severity ? (
        <Alert severity={queryData.severity} className="UsecaseWrapper_alert">
          {queryData.message}
        </Alert>
      ) : (
        typeof data?.remainingViews === 'number' && (
          <Alert severity="warning" className="UsecaseWrapper_alert">
            {data.remainingViews > 0
              ? `You have ${data.remainingViews} remaining free article views.`
              : 'You have exceeded your free daily article views.'}
          </Alert>
        )
      )}
    </UseCaseWrapper>
  );
}
