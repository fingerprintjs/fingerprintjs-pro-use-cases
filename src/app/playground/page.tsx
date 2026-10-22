import { headers } from 'next/headers';
import { PLAYGROUND_METADATA } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { fetchAiApiResult } from '../../server/automation-intelligence-api';
import { Playground } from './Playground';

export const metadata = generateUseCaseMetadata(PLAYGROUND_METADATA);

export default async function PlaygroundPage({ searchParams }: PageProps<'/playground'>) {
  // Reading headers makes this page render per request, which the AI API needs.
  const aiApiResult = await fetchAiApiResult(await headers(), '/playground', await searchParams);
  return <Playground aiApiResult={aiApiResult} />;
}
