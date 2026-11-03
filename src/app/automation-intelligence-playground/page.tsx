import { headers } from 'next/headers';
import { AUTOMATION_INTELLIGENCE_PLAYGROUND_METADATA } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { fetchAiApiResult } from '../../server/automation-intelligence-api';
import { ORIGINAL_REQUEST_TARGET_HEADER } from '../../server/request-target';
import { AutomationIntelligencePlayground } from './AutomationIntelligencePlayground';

export const metadata = generateUseCaseMetadata(AUTOMATION_INTELLIGENCE_PLAYGROUND_METADATA);

export default async function AutomationIntelligencePlaygroundPage() {
  // Reading headers makes this page render per request, which the AI API needs.
  const requestHeaders = await headers();
  const requestTarget =
    requestHeaders.get(ORIGINAL_REQUEST_TARGET_HEADER) ?? AUTOMATION_INTELLIGENCE_PLAYGROUND_METADATA.url;
  const aiApiResult = await fetchAiApiResult(requestHeaders, requestTarget);
  return <AutomationIntelligencePlayground aiApiResult={aiApiResult} />;
}
