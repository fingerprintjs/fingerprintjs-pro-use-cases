// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    formats: ['image/webp'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
    prependData: `@import "common.scss";`,
  },
};
