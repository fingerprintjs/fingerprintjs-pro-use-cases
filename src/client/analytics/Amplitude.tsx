import * as amplitude from '@amplitude/analytics-browser';
import { usePlaygroundSignals } from '../../app/playground/hooks/usePlaygroundSignals';
import { FunctionComponent } from 'react';

const AMPLITUDE_INGRESS_PROXY = 'https://dlxhio63e79vv.cloudfront.net/ampl-api/2/httpapi';
const EVENT_TYPE = 'Demo Page Viewed';

/**
 * This is an Amplitude plugin that renames the Page view event_properties according to our analytics needs
 * @returns EnrichmentPlugin
 */
const renameEventPropertiesEnrichment: amplitude.Types.EnrichmentPlugin = {
  name: 'rename-event-properties-enrichment',
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
    };
    return event;
  },
};

type AmplitudeProps = {
  apiKey: string;
};

export const Amplitude: FunctionComponent<AmplitudeProps> = ({ apiKey }) => {
  usePlaygroundSignals({
    onServerApiSuccess: (event) => {
      const visitorId = event.products.identification?.data?.visitorId;
      const botDetected = event?.products?.botd?.data?.bot?.result === 'bad' ? 'True' : 'False';

      amplitude.add(renameEventPropertiesEnrichment);
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
