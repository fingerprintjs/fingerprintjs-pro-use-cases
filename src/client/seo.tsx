import { PRODUCTION_URL, UseCase } from './content';
import { Metadata } from 'next';

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  path?: string;
};

/**
 * Generates Metadata object for Next `app` directory
 * https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
 */
export const generateMetadata = ({ title, description, image, path }: SeoProps): Metadata => {
  const metaImage = image ?? `${PRODUCTION_URL}/fingerprintDefaultMetaImage.png`;
  const metaUrl = `${PRODUCTION_URL}${path ?? ''}`;
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: 'Fingerprint Use Cases',
      images: [metaImage],
      url: metaUrl,
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: [metaImage],
      site: metaUrl,
    },
  };
};

export const generateUseCaseMetadata = (useCase: Pick<UseCase, 'titleMeta' | 'descriptionMeta' | 'url'>): Metadata =>
  generateMetadata({
    title: useCase.titleMeta,
    description: useCase.descriptionMeta,
    path: useCase.url,
  });
