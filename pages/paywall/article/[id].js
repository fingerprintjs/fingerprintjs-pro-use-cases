import { useRouter } from 'next/router';
import { useGetArticle } from '../../../shared/client/api/use-get-article';
import { UseCaseWrapper } from '../../../components/use-case-wrapper';
import { Skeleton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import Alert from '@mui/material/Alert';

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
    <UseCaseWrapper
      title={data?.article.title}
      hideSrcListItem
      hideDivider
      sx={{
        '& .UsecaseWrapper_content': {
          position: 'relative',
        },
      }}
    >
      <Tooltip title="Go back">
        <Link href="/paywall" passHref>
          <IconButton
            component="a"
            sx={{
              position: 'absolute',
              left: (theme) => theme.spacing(2),
              top: (theme) => theme.spacing(2),
            }}
          >
            <ArrowBack />
          </IconButton>
        </Link>
      </Tooltip>
      <Typography
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
