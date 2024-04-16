import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * In this file we manage environment variables using [t3-env](https://env.t3.gg/docs/introduction).
 * This is basically the same as just importing them like `process.env.VARIABLE` but:
 * - It provides a strongly typed `ENV` object so typos will result in TypeScript errors
 * - If a required environment variable is missing, it will throw an error at build time instead of runtime
 * - Plus other useful features like Zod validation and transformations, defaults, server vs client checks....
 **/
export const ENV = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw error if you access these variables on the client.
   *
   * Some default values are defined here to provide users with a "git-clone-and-it-just-works" experience when trying the demo,
   * with other protections in place to prevent abuse. This only makes sense in an education demo project like this one.
   * DO NOT expose your server-side secrets in your source code!
   */
  server: {
    // E2E tests and build variables
    // MIN_CONFIDENCE_SCORE: z.number().min(0.0).max(1.0).optional(),
    // TEST_BUILD: z.boolean().optional(),
    // Bot Firewall use case variables
    CLOUDFLARE_API_TOKEN: z.string().min(1),
    CLOUDFLARE_ZONE_ID: z.string().min(1),
    CLOUDFLARE_RULESET_ID: z.string().min(1),

    // Location spoofing demo feat. Sealed client results
    SEALED_RESULTS_DECRYPTION_KEY: z.string().min(1).default('nAEUm/yALfMwWGWzUEXjXplocr8ouYjAhEJgRnBNRwA='),
    SEALED_RESULTS_SERVER_API_KEY: z.string().min(1).default('cRg3axMS26qfkjcS7OFh'),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    // Location spoofing demo feat. Sealed client results
    NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY: z.string().min(1).default('2lFEzpuyfqkfQ9KJgiqv'),
    NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL: z
      .string()
      .min(1)
      .default(
        'https://staging.fingerprinthub.com/fp-sealed/agent?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
      ),
    NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT: z
      .string()
      .min(1)
      .default('https://staging.fingerprinthub.com/fp-sealed/result?region=us'),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    // MIN_CONFIDENCE_SCORE: process.env.MIN_CONFIDENCE_SCORE,
    // TEST_BUILD: process.env.TEST_BUILD,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_RULESET_ID: process.env.CLOUDFLARE_RULESET_ID,

    // Location spoofing demo feat. Sealed client results
    SEALED_RESULTS_DECRYPTION_KEY: process.env.SEALED_RESULTS_DECRYPTION_KEY,
    SEALED_RESULTS_SERVER_API_KEY: process.env.SEALED_RESULTS_SERVER_API_KEY,
    NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY,
    NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL: process.env.NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL,
    NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT: process.env.NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT,
  },
});
