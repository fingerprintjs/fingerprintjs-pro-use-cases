import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
// const { createEnv } = import('@t3-oss/env-nextjs');

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw error if you access these variables on the client.
   */
  server: {
    // E2E tests and build variables
    MIN_CONFIDENCE_SCORE: z.number().min(0.0).max(1.0).optional(),
    TEST_BUILD: z.boolean().optional(),
    // Bot Firewall use case variables
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    CLOUDFLARE_ZONE_ID: z.string().min(1),
    CLOUDFLARE_RULESET_ID: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    MIN_CONFIDENCE_SCORE: process.env.MIN_CONFIDENCE_SCORE,
    TEST_BUILD: process.env.TEST_BUILD,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_RULESET_ID: process.env.CLOUDFLARE_RULESET_ID,
  },
});
