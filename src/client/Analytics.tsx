/**
 * This file just contains code for tools that help us see trends in how people use demo.fingerprint.com
 * It is only deployed for production builds (`next build`) and when the expected environment variables are set
 * It is not part of the reference implementation for any of the use cases, feel free to ignore it
 **/
'use client';

import Script from 'next/script';
import { FunctionComponent, useEffect } from 'react';
import { env } from '../env';
import * as amplitude from '@amplitude/analytics-browser';
import { usePlaygroundSignals } from '../app/playground/hooks/usePlaygroundSignals';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { FP_LOAD_OPTIONS } from '../pages/_app';

// GTM API requires dataLayer access through global window variable
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types
    dataLayer: object[];
  }
}

const enableAnalytics = () => {
  // Required for development since without SSR sendEvent will be calPled before Helmet has a chance to inject the script that initializes dataLayer.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: 'event.enableAnalytics' }, { enableAnalytics: true });
};

const GTM_ID = env.NEXT_PUBLIC_GTM_ID;
const AMPLITUDE_API_KEY = env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

export const Analytics = () => {
  useEffect(() => {
    enableAnalytics();
  }, []);

  return (
    <>
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      {AMPLITUDE_API_KEY ? (
        <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
          <Amplitude apiKey={AMPLITUDE_API_KEY} />
        </FpjsProvider>
      ) : null}
    </>
  );
};

type AmplitudeProps = {
  apiKey: string;
};

const AMPLITUDE_INGRESS_PROXY = 'https://dlxhio63e79vv.cloudfront.net/ampl-api/2/httpapi';
const EVENT_TYPE = 'Demo Page Viewed';

/**
 * This is a plugin that renames the Page view event_properties according to our analytics needs
 * @returns EnrichmentPlugin
 */
const renameEventPropertiesEnrichment: amplitude.Types.EnrichmentPlugin = {
  name: 'rename-event-properties-enrichment',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async (event) => {
    // Only apply to Docs Page View events
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

const Amplitude: FunctionComponent<AmplitudeProps> = ({ apiKey }) => {
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

  return <></>;
};

const GoogleTagManager = ({ gtmId }: { gtmId: string }) => {
  return (
    <Script
      id='gtag-base'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer', '${gtmId}');
            `,
      }}
    />
  );
};
