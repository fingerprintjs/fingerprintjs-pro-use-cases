/**
 * This file just contains code for tools that help us see trends in how people use demo.fingerprint.com
 * It is only deployed for production builds (`next build`) and when the expected environment variables are set
 * It is not part of the reference implementation for any of the use cases, feel free to ignore it
 **/
'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { env } from '../env';

// GTM API requires dataLayer access through global window variable
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types
    dataLayer: object[];
  }
}

const GTM_ID = env.NEXT_PUBLIC_GTM_ID;

const enableAnalytics = () => {
  // Required for development since without SSR sendEvent will be calPled before Helmet has a chance to inject the script that initializes dataLayer.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: 'event.enableAnalytics' }, { enableAnalytics: true });
};

export const Analytics = () => {
  useEffect(() => {
    enableAnalytics();
  }, []);

  return (
    <>
      {GTM_ID ? (
        <Script
          id='gtag-base'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer', '${GTM_ID}');
            `,
          }}
        />
      ) : null}
    </>
  );
};
