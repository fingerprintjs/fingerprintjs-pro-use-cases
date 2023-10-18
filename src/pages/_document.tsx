import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="alternate" href="https://demo.fingerprint.com" hrefLang="en" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
