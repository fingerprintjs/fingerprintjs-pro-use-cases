import { ARTICLES } from '../../../api/articles';
import { USE_CASES } from '../../../../../client/content';
import { generateUseCaseMetadata } from '../../../../../client/seo';
import { Article } from '../Article';

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({ id: article.id }));
}

export const metadata = generateUseCaseMetadata(USE_CASES.paywall);

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Article articleId={id} embed={true} />;
}
