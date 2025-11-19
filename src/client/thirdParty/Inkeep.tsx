'use client';

import dynamic from 'next/dynamic';
import { env } from '../../env';

import type {
  InkeepBaseSettings,
  InkeepModalSettings,
  InkeepAIChatSettings,
  InkeepSearchSettings,
  InkeepCallbackEvent,
  GetHelpOptionClickedEvent,
} from '@inkeep/cxkit-types';

import { trackAskAIHelpChosen, trackAskAIOpen } from './Amplitude';

const ChatButton = dynamic(() => import('@inkeep/cxkit-react').then((mod) => mod.InkeepChatButton), {
  ssr: false,
});

const useInkeepSettings = () => {
  const apiKey = env.NEXT_PUBLIC_INKEEP_API_KEY;

  const baseSettings: InkeepBaseSettings = {
    apiKey,
    organizationDisplayName: 'Fingerprint',
    primaryBrandColor: '#F04405',

    onEvent: (event: InkeepCallbackEvent) => {
      if (event.eventName === 'get_help_option_clicked') {
        const e = event as GetHelpOptionClickedEvent;
        trackAskAIHelpChosen({
          helpMethod: e.properties.getHelpOption.name,
          'Demo Page Path': document.location.pathname,
          'Demo Page Title': document.title,
        });
      }
      if (event.eventName === 'modal_opened') {
        trackAskAIOpen({
          'Demo Page Path': document.location.pathname,
          'Demo Page Title': document.title,
        });
      }
    },
  };
  const modalSettings: InkeepModalSettings = {};

  const aiChatSettings: InkeepAIChatSettings = {
    chatSubjectName: 'Fingerprint',
    aiAssistantAvatar: 'https://fingerprint.com/img/uploads/fpjs-small-logo-for-email.png',
    disclaimerSettings: {
      isEnabled: true,
      label: 'Information',
      tooltip:
        'Powered by our friends at Inkeep, this AI assistant uses information from our documentation and website. Please do not provide sensitive or personal information. AI answers are not guaranteed to be accurate in all cases. For complex issues, consult our official documentation or contact support.',
    },
    getHelpOptions: [
      {
        name: 'Contact support',
        icon: { builtIn: 'IoChatbubblesOutline' },
        action: {
          type: 'open_link',
          url: 'https://fingerprint.com/support/',
        },
        isPinnedToToolbar: true,
      },
      {
        name: 'GitHub',
        icon: { builtIn: 'FaGithub' },
        action: {
          type: 'open_link',
          url: 'https://github.com/fingerprintjs',
        },
      },
      {
        name: 'Discord',
        icon: { builtIn: 'FaDiscord' },
        action: {
          type: 'open_link',
          url: 'https://discord.gg/ad6R2ttHVX',
        },
      },
    ],

    exampleQuestions: [
      'How to implement a webhook handler on identification events?',
      'How to track visitors across multiple domains?',
      'Fingerprint Identification vs FingerprintJS?',
      'How to proxy requests through my own domain?',
    ],

    shouldOpenLinksInNewTab: true,
  };

  const searchSettings: InkeepSearchSettings = {};

  return { baseSettings, modalSettings, aiChatSettings, searchSettings };
};

export function InkeepChatButton() {
  const settings = useInkeepSettings();

  return <ChatButton {...settings} defaultView='chat' forceDefaultView={true} />;
}
