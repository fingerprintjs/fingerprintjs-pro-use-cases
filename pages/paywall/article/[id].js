import { useRouter } from 'next/router';
import { useGetArticle } from '../../../shared/client/api/use-get-article';
import { UseCaseWrapper } from '../../../components/use-case-wrapper';
import { Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { FullPagePaper } from '../../../components/full-page-paper';

export default function Article() {
  const router = useRouter();

  const articleQuery = useGetArticle(router.query.id);

  if (articleQuery.isLoading) {
    return (
      <FullPagePaper variant="outlined">
        <CircularProgress />
      </FullPagePaper>
    );
  }

  const queryData = articleQuery.data;
  const data = queryData?.data;

  if (queryData?.message && queryData?.severity) {
    return (
      <FullPagePaper variant="outlined">
        <Alert
          severity={queryData.severity}
          className="UsecaseWrapper_alert"
          action={
            <Link passHref href="/paywall">
              <Button component="a">Go back</Button>
            </Link>
          }
        >
          {queryData.message}
        </Alert>
      </FullPagePaper>
    );
  }

  if (!data?.article) {
    return null;
  }

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
        {data?.article.content}
      </Typography>
      <Alert severity="warning" className="UsecaseWrapper_alert">
        {data.remainingViews > 0
          ? `You have ${data.remainingViews} remaining free article views.`
          : 'You have exceeded your free article views.'}
      </Alert>
    </UseCaseWrapper>
  );
}
