import * as amplitude from '@amplitude/analytics-browser';
import { usePlaygroundSignals } from '../../app/playground/hooks/usePlaygroundSignals';
import { FunctionComponent } from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { useLocation } from 'react-use';

const AMPLITUDE_INGRESS_PROXY = 'https://demo.fingerprint.com/ampl-api/2/httpapi';
const EVENT_TYPE = 'Demo Page Viewed';
const ASK_AI_CHOSEN_EVENT_TYPE = 'Demo Ask AI Help Chosen';

/**
 * This is an Amplitude plugin that renames the Page view event_properties according to our analytics needs
 */
const demoPageViewedEventPropertiesEnrichment = (botDetected: 'True' | 'False'): amplitude.Types.EnrichmentPlugin => ({
  name: 'custom-event-properties-enrichment',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async (event) => {
    // Only apply to Demo Page View events
    if (event.event_type !== EVENT_TYPE) {
      return event;
    }

    // Rename event properties
    const originalEventProperties = event.event_properties;
    event.event_properties = {
      'Demo Page Domain': originalEventProperties?.['[Amplitude] Page Domain'],
      'Demo Page Location': originalEventProperties?.['[Amplitude] Page Location'],
      'Demo Page Path': originalEventProperties?.['[Amplitude] Page Path'],
      'Demo Page Title': originalEventProperties?.['[Amplitude] Page Title'],
      'Demo Page URL': originalEventProperties?.['[Amplitude] Page URL'],
      botDetected,
    };
    return event;
  },
});

type AmplitudeProps = {
  apiKey: string;
};

function initAmplitude(apiKey: string) {
  amplitude.init(apiKey, {
    defaultTracking: {
      attribution: false,
      sessions: false,
      formInteractions: false,
      fileDownloads: false,
    },
    serverUrl: AMPLITUDE_INGRESS_PROXY,
  });
}

function initPlaygroundSignals() {
  usePlaygroundSignals({
    onServerApiSuccess: (event) => {
      const visitorId = event.products.identification?.data?.visitorId;
      const botDetected = event?.products?.botd?.data?.bot?.result === 'bad' ? 'True' : 'False';

      const location = useLocation();
      const pagePath = location.pathname;
      const pageTitle = document.title;

      amplitude.add(demoPageViewedEventPropertiesEnrichment(botDetected));

      amplitude.track(EVENT_TYPE, {
        botDetected,
        visitorId,
        'Docs Page Path': pagePath,
        'Docs Page Title': pageTitle,
      });
    },
  });
}

export async function trackAskAIkHelpMethodChosen(helpMethod: string) {
  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );

  const { visitorId } = await getVisitorData({ ignoreCache: true });

  amplitude.track(ASK_AI_CHOSEN_EVENT_TYPE, {
    helpMethod,
    visitorId,
  });
}

export const Amplitude: FunctionComponent<AmplitudeProps> = ({ apiKey }) => {
  initAmplitude(apiKey);
  initPlaygroundSignals();

  return null;
};