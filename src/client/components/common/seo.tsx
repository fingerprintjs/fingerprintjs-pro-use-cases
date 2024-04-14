import Head from 'next/head';
import { FunctionComponent } from 'react';
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

export const generateUseCaseMetadata = (useCase: UseCase): Metadata =>
  generateMetadata({
    title: useCase.titleMeta,
    description: useCase.descriptionMeta,
    path: useCase.url,
  });

/**
 * Generates next/Head tags for Next `pages` directory
 */
export const SEO: FunctionComponent<SeoProps> = ({ title, description, image, path }) => {
  const metaImage = image ?? `${PRODUCTION_URL}/fingerprintDefaultMetaImage.png`;
  const metaUrl = `${PRODUCTION_URL}${path ?? ''}`;
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='image' content={metaImage} />

      <meta property='og:type' content='website' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:site_name' content='Fingerprint Use Cases' />
      <meta property='og:image' content={metaImage} />
      <meta property='og:url' content={metaUrl} />

      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:image' content={metaImage} />
      <meta name='twitter:url' content={metaUrl} />
    </Head>
  );
};
