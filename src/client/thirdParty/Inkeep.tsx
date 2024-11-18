'use client';

import { InkeepChatButtonProps } from '@inkeep/uikit';
import type {
  InkeepAIChatSettings,
  InkeepSearchSettings,
  InkeepBaseSettings,
  InkeepModalSettings,
} from '@inkeep/uikit';
import { env } from '../../env';
import dynamic from 'next/dynamic';
import { trackAskAIkHelpMethodChosen } from './Amplitude';
import { GetDataOptions, useVisitorData, VisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { useLocation } from 'react-use';
import { LocationSensorState } from 'react-use/lib/useLocation';

const GET_HELP_OPTIONS_CLICKED = 'get_help_option_clicked';

/**
 * Inkeep (AI Help) chat button
 * Implemented according to https://docs.inkeep.com/integrations/nextjs/chat-button
 */

const ChatButton = dynamic(() => import('@inkeep/uikit').then((mod) => mod.InkeepChatButton), {
  ssr: false,
});

type InkeepSharedSettings = {
  baseSettings: InkeepBaseSettings;
  aiChatSettings: InkeepAIChatSettings;
  searchSettings: InkeepSearchSettings;
  modalSettings: InkeepModalSettings;
};

export const createCustomAnalyticsCallback = (
  getVisitorData: (getDataOptions?: GetDataOptions<boolean>) => Promise<VisitorData<boolean>>,
  location: LocationSensorState,
) => {
  return async (event: any) => {
    if (event.eventName === GET_HELP_OPTIONS_CLICKED) {
      const { visitorId } = await getVisitorData({ ignoreCache: true });

      const { name } = event.properties;
      const pagePath = location.pathname || '';
      const pageTitle = document.title;

      await trackAskAIkHelpMethodChosen(name, visitorId, pagePath, pageTitle);
    }
  };
};

const useInkeepSettings = (
  getVisitorData: (getDataOptions?: GetDataOptions<boolean>) => Promise<VisitorData<boolean>>,
  location: LocationSensorState,
): InkeepSharedSettings => {
  const apiKey = env.NEXT_PUBLIC_INKEEP_API_KEY;
  const integrationId = env.NEXT_PUBLIC_INKEEP_INTEGRATION_ID;
  const organizationId = env.NEXT_PUBLIC_INKEEP_ORG_ID;

  const customAnalyticsCallback = createCustomAnalyticsCallback(getVisitorData, location);

  const baseSettings: InkeepBaseSettings = {
    apiKey,
    integrationId,
    organizationId,
    primaryBrandColor: '#F04405',
    logEventCallback: customAnalyticsCallback,
  };
  const modalSettings: InkeepModalSettings = {};
  const searchSettings: InkeepSearchSettings = {};
  const aiChatSettings: InkeepAIChatSettings = {
    chatSubjectName: 'Fingerprint',
    botAvatarSrcUrl: 'https://fingerprint.com/img/uploads/fpjs-small-logo-for-email.png',
    disclaimerSettings: {
      isDisclaimerEnabled: true,
      disclaimerLabel: 'Information',
      disclaimerTooltip:
        'Powered by our friends at Inkeep, this AI assistant uses information from our documentation and website. Please do not provide sensitive or personal information. AI answers are not guaranteed to be accurate in all cases. For complex issues, consult our official documentation or contact support.',
    },
    getHelpCallToActions: [
      {
        name: 'Contact support',
        url: 'https://fingerprint.com/support/',
        icon: {
          builtIn: 'IoChatbubblesOutline',
        },
      },
      {
        name: 'GitHub',
        url: 'https://github.com/fingerprintjs',
        icon: {
          builtIn: 'FaGithub',
        },
      },
      {
        name: 'Discord',
        url: 'https://discord.gg/ad6R2ttHVX',
        icon: {
          builtIn: 'FaDiscord',
        },
      },
    ],
    quickQuestions: [
      'How to implement a webhook handler on identification events?',
      'How to track visitors across multiple domains?',
      'Fingerprint Identification vs FingerprintJS?',
      'How to proxy requests through my own domain?',
    ],
  };

  return { baseSettings, aiChatSettings, searchSettings, modalSettings };
};

export function InkeepChatButton() {
  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );
  const location = useLocation();

  const { baseSettings, aiChatSettings, searchSettings, modalSettings } = useInkeepSettings(getVisitorData, location);

  const chatButtonProps: InkeepChatButtonProps = {
    baseSettings,
    aiChatSettings,
    searchSettings,
    modalSettings,
  };

  return <ChatButton {...chatButtonProps} />;
}
