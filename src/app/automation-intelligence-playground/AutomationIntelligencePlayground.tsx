'use client';

import Link from 'next/link';
import Container from '../../client/components/Container';
import { ResourceLinks } from '../../client/components/ResourceLinks/ResourceLinks';
import { PLAYGROUND_METADATA } from '../../client/content';
import type { AiApiResult } from '../../server/automation-intelligence-api';
import { LayoutUI } from '../LayoutUI';
import { HowTo, HowToAccordion } from '../playground/components/HowToUseThisPlayground';
import playgroundStyles from '../playground/playground.module.scss';
import { AiApiSection } from './components/AiApiSection';

const howTo: HowTo[] = [
  {
    title: 'AI agent detection',
    content: [
      `If you’re using a normal browser, you will see a green box with “Bot not detected”.`,
      `Ask an AI chat app like ChatGPT or Claude: “Open https://demo.fingerprint.com/automation-intelligence-playground and tell me what you see.” It will show the agent’s name, provider, and identity if detected or disclosed.`,
    ],
  },
  {
    title: 'Raw result',
    content: [
      <>
        Run <code>curl https://demo.fingerprint.com/automation-intelligence</code> in your terminal.
      </>,
      `The response is the raw Automation Intelligence API event for your request, as JSON.`,
    ],
  },
  {
    title: 'Spoofed bot',
    content: [
      <>
        Pretend to be OpenAI’s crawler with{' '}
        <code>curl -A &apos;GPTBot/1.0&apos; https://demo.fingerprint.com/automation-intelligence</code>.
      </>,
      <>
        The result shows <code>&quot;identity&quot;: &quot;spoofed&quot;</code>, because the request doesn’t come from
        OpenAI.
      </>,
    ],
  },
];

/**
 * Shows what the Automation Intelligence API knows about the page request.
 * Everything here comes from the server, so the page works without JavaScript.
 */
export function AutomationIntelligencePlayground({ aiApiResult }: { aiApiResult: AiApiResult }) {
  return (
    <LayoutUI>
      <Container size='large' className={playgroundStyles.hero}>
        <h1>
          <span>Automation Intelligence</span> Playground
        </h1>
        <p>
          Detect AI agent network requests without browsers or JavaScript. To analyze your browser, try the{' '}
          <Link href={PLAYGROUND_METADATA.url}>Playground</Link>.
        </p>
      </Container>
      <AiApiSection result={aiApiResult} />
      <Container size='large' className={playgroundStyles.isSection}>
        <h2 className={playgroundStyles.sectionTitle}>How to use this playground</h2>
        <HowToAccordion items={howTo} />
      </Container>
      <Container size='large' className={playgroundStyles.learnMoreSection}>
        <h2 className={playgroundStyles.sectionTitle}>Learn more</h2>
      </Container>
      <ResourceLinks
        resources={[
          {
            title: 'Automation Intelligence API',
            url: 'https://docs.fingerprint.com/reference/automation-intelligence-api',
            type: 'Documentation',
          },
          {
            title: 'Web Bot Auth',
            url: 'https://docs.fingerprint.com/docs/bot-detection/web-bot-auth-implementation',
            type: 'Documentation',
          },
        ]}
      />
    </LayoutUI>
  );
}
