import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ARTICLES_SHORTENED, ArticleData } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';

export async function getServerSideProps() {
  return {
    props: {
      articles: ARTICLES_SHORTENED,
    },
  };
}

type PaywallProps = CustomPageProps & {
  articles: ArticleData[];
};

export default function Paywall({ articles, embed }: PaywallProps) {
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed}>
      {articles && (
        <Stack spacing={6}>
          {articles.map((article) => (
            <Card
              href={`/paywall/article/${article.id}${embed ? '/embed' : ''}`}
              key={article.id}
              variant="outlined"
              component="a"
              className="ArticleLink"
            >
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
