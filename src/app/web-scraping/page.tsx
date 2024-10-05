import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { WebScrapingUseCase } from './WebScraping';

export const metadata = generateUseCaseMetadata(USE_CASES.webScraping);

export default function WebScrapingPage() {
  return <WebScrapingUseCase />;
}
