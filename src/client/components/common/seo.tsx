import Head from 'next/head';
import { FunctionComponent } from 'react';
import { PRODUCTION_URL } from './content';

type HeadSEOProps = {
  title: string;
  description: string;
  image?: string;
};

export const SEO: FunctionComponent<HeadSEOProps> = ({ title, description, image }) => {
  const metaImage = image ?? `/fingerprintDefaultMetaImage.png`;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="image" content={metaImage} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Fingerprint Use Cases" />
      <meta property="og:image" content={metaImage} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={metaImage} />
    </Head>
  );
};
