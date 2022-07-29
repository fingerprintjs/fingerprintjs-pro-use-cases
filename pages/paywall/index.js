import { UseCaseWrapper } from '../../components/use-case-wrapper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export async function getStaticProps() {
  const articles = await fetch('/api/paywall/get-articles').then((res) => res.json());

  return {
    props: {
      articles,
    },
  };
}

export default function LoanRisk({ articles }) {
  return (
    <UseCaseWrapper title="Paywall" description="This page demonstrates paywall implementation using Fingerprint PRO.">
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
