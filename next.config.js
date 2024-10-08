// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

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
        ],
      },
    ];
  },
};
