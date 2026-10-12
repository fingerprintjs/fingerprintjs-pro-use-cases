import Script from 'next/script';

type GoogleTagManagerProps = {
  gtmId: string;
  /** Called once the container has loaded, or failed to load (blocked by an ad blocker, offline, ...). */
  onSettled?: () => void;
};

export const GoogleTagManager = ({ gtmId, onSettled }: GoogleTagManagerProps) => {
  return (
    <>
      <Script
        id='gtm-data-layer'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
              `,
        }}
      />
      {/*
        The container is loaded with `next/script` rather than with the `document.createElement` call from
        Google's own snippet (this is also what `@next/third-parties` does). That way we get a reliable
        `onLoad`, which we need to know when the Google tag has read the `_gl` linker parameter off the URL.
        `next/script` never fires `onLoad` for inline scripts, and the inline snippet would in any case report
        itself as loaded before the container it injects had a chance to run.
      */}
      <Script
        id='gtm-base'
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
        onLoad={onSettled}
        onError={onSettled}
      />
    </>
  );
};
