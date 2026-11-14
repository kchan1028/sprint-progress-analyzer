/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_HOME?: string;
  readonly VITE_ADSENSE_SLOT_DASHBOARD?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Google AdSense's ad queue - see src/utils/adsense.ts and src/components/AdSense.tsx. */
  adsbygoogle: unknown[];
  /** Google Analytics (gtag.js) - see src/utils/analytics.ts. */
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}
