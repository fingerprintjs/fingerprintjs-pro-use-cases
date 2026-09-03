import 'server-only';

/**
 * Server-side environment variables for Next.js server code.
 * \`import 'server-only'\` makes Next.js fail the client compile if this module is imported from client code.
 * Node loaders (next.config.ts) should import \`./serverEnv\` instead.
 *
 * Split from the client schema so Zod \`.default(...)\` secret strings are not bundled into client JavaScript.
 * https://env.t3.gg/docs/nextjs
 */
export { serverEnv } from './serverEnv';
