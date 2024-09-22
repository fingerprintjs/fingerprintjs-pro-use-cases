import { ARTICLES } from '../../api/articles';
import { USE_CASES } from '../../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../../client/components/common/seo';
import { Article } from './Article';

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ id: article.id }));
}

export const metadata = generateUseCaseMetadata(USE_CASES.paywall);

export default function ArticlePage({ params }: { params: { id: string } }) {
  return <Article articleId={params.id} embed={false} />;
}
