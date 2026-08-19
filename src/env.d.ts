/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_INTERCOM_APP_ID?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Intercom Messenger JS API — see src/components/integrations/Intercom.astro. */
    Intercom?: (...args: unknown[]) => void;
    /** Boot config read by Intercom's widget, incl. the `ie_source` surface stamp. */
    intercomSettings?: Record<string, unknown>;
  }
}
