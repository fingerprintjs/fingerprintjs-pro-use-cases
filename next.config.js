// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * https://nextjs.org/docs/14/app/building-your-application/configuring/content-security-policy#without-nonces
 * Using nonces would be better but also has performacne implications
 * We can upgrade to that approach if necessary
 */
const CSP_HEADER =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://fpnpmcdn.net https://metrics.fingerprinthub.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' blob: data: https://fpnpmcdn.net https://api.mapbox.com; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https://api.inkeep.com https://api.io.inkeep.com https://www.googletagmanager.com https://www.google.com https://api.fpjs.io https://*.api.fpjs.io https://metrics.fingerprinthub.com; " +
  "worker-src 'self' blob: 'unsafe-eval' https://fpnpmcdn.net; " +
  "child-src 'self' blob: https://fpnpmcdn.net; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none'; " +
  "upgrade-insecure-requests;";

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  images: {
    formats: ['image/webp'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/client/styles')],
    prependData: `@import "common.scss";`,
  },
  experimental: {
    // Necessary to prevent https://github.com/sequelize/sequelize/issues/16589
    serverComponentsExternalPackages: ['sequelize'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: CSP_HEADER,
          },
        ],
      },
    ];
  },
};
