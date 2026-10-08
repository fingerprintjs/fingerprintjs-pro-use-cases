import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

// Validate env at build/dev startup (Next 16+ can import TS without jiti).
// Import serverEnv (no `server-only` marker). next.config.ts is a Node module, not the app compiler.
// https://env.t3.gg/docs/nextjs
import './src/env/client';
import './src/env/serverEnv';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.join(configDir, 'src/client/styles');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
  },
  sassOptions: {
    includePaths: [stylesDir],
    prependData: `@import "${stylesDir.replace(/\\/g, '/')}/common.scss";`,
  },
  // Necessary to prevent https://github.com/sequelize/sequelize/issues/16589
  serverExternalPackages: ['sequelize'],
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

export default nextConfig;
