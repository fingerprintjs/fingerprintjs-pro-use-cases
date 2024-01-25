import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { ARTICLES } from '../../server/paywall/articles';
import { CustomPageProps } from '../_app';
import { USE_CASES } from '../../client/components/common/content';
import { ArticleCard, ArticleGrid } from '../../client/components/paywall/ArticleGrid';

/**
 * Main Paywall use case page with article listing
 */
export default function Paywall({ embed }: CustomPageProps) {
  const heroArticle = ARTICLES[0];
  const gridArticles = ARTICLES.slice(1);
  return (
    <UseCaseWrapper useCase={USE_CASES.paywall} embed={embed}>
      {heroArticle && <ArticleCard article={heroArticle} embed={embed} isHeroArticle />}
      {gridArticles && <ArticleGrid articles={gridArticles} embed={embed} />}
    </UseCaseWrapper>
  );
}
