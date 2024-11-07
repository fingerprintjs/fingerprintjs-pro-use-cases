import type {
  InkeepAIChatSettings,
  InkeepSearchSettings,
  InkeepBaseSettings,
  InkeepModalSettings,
} from '@inkeep/uikit';
import { AIChatDisclaimerSettings } from '@inkeep/uikit';

type InkeepSharedSettings = {
  baseSettings: InkeepBaseSettings;
  aiChatSettings: InkeepAIChatSettings;
  searchSettings: InkeepSearchSettings;
  modalSettings: InkeepModalSettings;
};

const useInkeepSettings = (): InkeepSharedSettings => {
  const baseSettings: InkeepBaseSettings = {
    apiKey: '64fc830c4e4bb4b94990b4a21712e89d79a7a6770efb4043',
    integrationId: 'cm2kpiuzn04o2uk7k2mwkdy3n',
    organizationId: 'org_d0VDri411QUR4Xi7',
    primaryBrandColor: '#F04405',
    //logEventCallback: customAnalyticsCallback,
  };

  const disclaimerSettings: AIChatDisclaimerSettings = {
    isDisclaimerEnabled: true,
    disclaimerLabel: 'Information',
    disclaimerTooltip:
      'Powered by our friends at Inkeep, this AI assistant uses information from our documentation and website. Please do not provide sensitive or personal information. AI answers are not guaranteed to be accurate in all cases. For complex issues, consult our official documentation or contact support.',
  };

  const modalSettings: InkeepModalSettings = {};

  const searchSettings: InkeepSearchSettings = {};

  const aiChatSettings: InkeepAIChatSettings = {
    chatSubjectName: 'Fingerprint',
    botAvatarSrcUrl: 'https://fingerprint.com/img/uploads/fpjs-small-logo-for-email.png',
    disclaimerSettings: disclaimerSettings,
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

export default useInkeepSettings;
