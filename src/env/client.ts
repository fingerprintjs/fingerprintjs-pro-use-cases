import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { isServer } from './isServer';

/**
 * Client-side environment variables (and server).
 * Only NEXT_PUBLIC_* values belong here — this module is safe to import from client components.
 *
 * Split from the server schema so Zod server defaults/secrets are not shipped in the browser bundle.
 * https://env.t3.gg/docs/nextjs
 */
export const clientEnv = createEnv({
  client: {
    // Main Fingerprint configuration
    NEXT_PUBLIC_API_KEY: z.string().min(1).default('lwIgYR2dpSJfW830B24h'),
    NEXT_PUBLIC_REGION: z.enum(['eu', 'us', 'ap']).default('us'),
    NEXT_PUBLIC_SCRIPT_URL_PATTERN: z
      .string()
      .min(1)
      .default('https://metrics.fingerprinthub.com/web/v<version>/<apiKey>/loader_v<loaderVersion>.js'),
    NEXT_PUBLIC_ENDPOINT: z.string().min(1).default('https://metrics.fingerprinthub.com'),

    // Playground
    NEXT_PUBLIC_MAPBOX_API_TOKEN: z.string().min(1).optional(),

    // Fingerprint configuration for VPN Detection demo feat. Sealed client results
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
    // Analytics
    NEXT_PUBLIC_GTM_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().min(1).optional(),
    // Inkeep
    NEXT_PUBLIC_INKEEP_API_KEY: z.string().min(1).default('b0537306817fb8a0daea377df2b273d1b00ac709182d1dc7'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_SCRIPT_URL_PATTERN: process.env.NEXT_PUBLIC_SCRIPT_URL_PATTERN,
    NEXT_PUBLIC_ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
    NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
    NEXT_PUBLIC_MAPBOX_API_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN,
    NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY,
    NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL: process.env.NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL,
    NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT: process.env.NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
    NEXT_PUBLIC_INKEEP_API_KEY: process.env.NEXT_PUBLIC_INKEEP_API_KEY,
  },
  emptyStringAsUndefined: true,
  isServer,
});
