import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { isServer } from './isServer';

/**
 * Server-side environment variables.
 * `import 'server-only'` makes Next.js fail the client compile if this module is imported from client code.
 * Node entry points that are not Next (tsx cron, Vitest) must set the `react-server` condition
 * or alias `server-only`, or this import throws.
 *
 * Some default values are defined here to provide users with a "git-clone-and-it-just-works" experience when trying the demo,
 * with other protections in place to prevent abuse. This only makes sense in an education demo project like this one.
 * DO NOT expose your server-side secrets in your source code!
 *
 * Split from the client schema so Zod `.default(...)` secret strings are not bundled into client JavaScript.
 * https://env.t3.gg/docs/nextjs
 */
export const serverEnv = createEnv({
  server: {
    // Main Fingerprint configuration
    SERVER_API_KEY: z.string().min(1).default('fMUtVoWHKddpfOheQww2'),
    // Use a low default confidence score limit to make sure production e2e tests are not flaky
    // Users are advised to decide for themselves the correct threshold for their use case
    // It can be pretty nuanced: https://dev.fingerprint.com/docs/identification-accuracy-and-confidence#confidence-score
    MIN_CONFIDENCE_SCORE: z.coerce.number().min(0.0).max(1.0).default(0.4),
    // Proxies that append to X-Forwarded-For after the client IP. 0 = use the right-most hop.
    // This deploy (CloudFront → Digital Ocean) needs 2; set it in the host env, not here.
    TRUSTED_PROXY_COUNT: z.coerce.number().int().min(0).max(10).default(0),

    // Credential stuffing demo
    KNOWN_VISITOR_IDS: z.string().min(1).default('').optional(),

    // Bot firewall use case Cloudflare settings
    CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
    CLOUDFLARE_ZONE_ID: z.string().min(1).optional(),
    CLOUDFLARE_RULESET_ID: z.string().min(1).optional(),

    // SMS Pumping use case
    TWILIO_API_KEY_SID: z.string().min(1).optional(),
    TWILIO_API_KEY_SECRET: z.string().min(1).optional(),
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_FROM_NUMBER: z.string().min(1).optional(),

    // VPN Detection demo feat. Sealed client results
    SEALED_RESULTS_DECRYPTION_KEY: z.string().min(1).default('nAEUm/yALfMwWGWzUEXjXplocr8ouYjAhEJgRnBNRwA='),
    SEALED_RESULTS_SERVER_API_KEY: z.string().min(1).default('cRg3axMS26qfkjcS7OFh'),
  },
  // Next.js >= 13.4.4: only client vars need manual destructuring; this file has none.
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  isServer,
});
