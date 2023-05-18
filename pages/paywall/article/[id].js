import { useRouter } from 'next/router';
import { Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useGetArticle } from '../../../client/api/personalization/use-get-article';
import { UseCaseWrapper } from '../../../client/components/use-case-wrapper';

function ArticleSkeleton({ animation = true }) {
  const skeletons = Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} animation={animation} />);

  return <>{skeletons}</>;
}

export default function Article() {
  const router = useRouter();

  const articleQuery = useGetArticle(router.query.id);

  const queryData = articleQuery.data;
  const data = queryData?.data;

  return (
    <UseCaseWrapper title={data?.article.title} hideSrcListItem hideDivider returnUrl="/paywall">
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
