import { useRouter } from 'next/router';
import { Skeleton, SkeletonTypeMap } from '@mui/material';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useGetArticle } from '../../../../client/api/personalization/use-get-article';
import { UseCaseWrapper } from '../../../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { CustomPageProps } from '../../../_app';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

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
    <UseCaseWrapper
      useCase={{ title: data?.article.title }}
      hideGithubLink
      contentSx={{ minHeight: '60vh' }}
      embed={embed}
    >
      {/* This back button is temporary, will be addressed in the use case redesign */}
      {returnUrl && (
        <Link href={returnUrl} style={{ display: 'flex', gap: '4px' }}>
          <ArrowBack />
          Go back to articles
        </Link>
      )}
      <Typography
        className="ArticleContent"
        sx={{
          marginTop: (theme) => theme.spacing(6),
        }}
      >
        {data?.article.content ?? <ArticleSkeleton animation={articleQuery.isLoading ? 'wave' : false} />}
      </Typography>
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
