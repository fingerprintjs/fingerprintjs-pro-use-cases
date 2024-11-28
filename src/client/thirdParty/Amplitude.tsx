import * as amplitude from '@amplitude/analytics-browser';
import { usePlaygroundSignals } from '../../app/playground/hooks/usePlaygroundSignals';
import { FunctionComponent } from 'react';

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

export function trackAskAIHelpMethodChosen(helpMethod: string, pagePath: string, pageTitle: string) {
  amplitude.track(ASK_AI_CHOSEN_EVENT_TYPE, {
    helpMethod,
    'Demo Page Path': pagePath,
    'Demo Page Title': pageTitle,
  });
}

export const Amplitude: FunctionComponent<AmplitudeProps> = ({ apiKey }) => {
  usePlaygroundSignals({
    onServerApiSuccess: (event) => {
      const visitorId = event.products.identification?.data?.visitorId;
      const botDetected = event?.products?.botd?.data?.bot?.result === 'bad' ? 'True' : 'False';

      amplitude.add(demoPageViewedEventPropertiesEnrichment(botDetected));
      amplitude.init(apiKey, {
        defaultTracking: {
          pageViews: {
            eventType: EVENT_TYPE,
          },
          attribution: false,
          sessions: false,
          formInteractions: false,
          fileDownloads: false,
        },
        deviceId: visitorId,
        serverUrl: AMPLITUDE_INGRESS_PROXY,
      });

      // Set Amplify user's custom `botDetected` property based on Fingerprint Bot Detection result
      const identifyEvent = new amplitude.Identify();
      identifyEvent.set('botDetected', botDetected);
      amplitude.identify(identifyEvent);
    },
  });

  return null;
};
