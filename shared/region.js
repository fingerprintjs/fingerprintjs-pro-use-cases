export function resolveFrontendRegion() {
  return process.env.NEXT_PUBLIC_FRONTEND_REGION ?? 'us';
}

export function resolveBackendRegion() {
  return process.env.BACKEND_REGION ?? 'Global';
}
