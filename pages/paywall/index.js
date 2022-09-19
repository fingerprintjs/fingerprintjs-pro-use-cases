import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { SITE_URL } from '../../shared/const';
import { ARTICLE_VIEW_LIMIT } from '../../shared/paywall/constants';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';

export async function getServerSideProps() {
  const articles = await fetch(`${SITE_URL}/api/paywall/get-articles`).then((res) => res.json());

  return {
    props: {
      articles,
    },
  };
}

export default function LoanRisk({ articles }) {
  return (
    <UseCaseWrapper
      title="Paywall"
      description="This page demonstrates paywall implementation using Fingerprint Pro."
      listItems={[
        <>
          We keep track of how many articles you have viewed per day. You can view {ARTICLE_VIEW_LIMIT} articles daily.
        </>,
        <>If you exceed your daily free limit of views, we return an error instead of an article.</>,
        <>You can try switching to the incognito mode or clearing cookies.</>,
      ]}
    >
      {articles.data && (
        <Stack spacing={6}>
          {articles.data.map((article) => (
            <Card href={`/paywall/article/${article.id}`} key={article.id} variant="outlined" component="a">
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {article.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {article.content}
                </Typography>
                <Typography variant="caption">{article.date}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </UseCaseWrapper>
  );
}
