import { headers } from 'next/headers';
import { PLAYGROUND_METADATA } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { fetchAiApiResult } from '../../server/automation-intelligence-api';
import { ORIGINAL_REQUEST_TARGET_HEADER } from '../../server/request-target';
import { Playground } from './Playground';

export const metadata = generateUseCaseMetadata(PLAYGROUND_METADATA);

export default async function PlaygroundPage() {
  // Reading headers makes this page render per request, which the AI API needs.
  const requestHeaders = await headers();
  const requestTarget = requestHeaders.get(ORIGINAL_REQUEST_TARGET_HEADER) ?? '/playground';
  const aiApiResult = await fetchAiApiResult(requestHeaders, requestTarget);
  return <Playground aiApiResult={aiApiResult} />;
}
