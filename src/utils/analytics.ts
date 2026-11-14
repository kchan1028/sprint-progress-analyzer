const ANALYTICS_SCRIPT_ID = 'ga4-script';

let scriptRequested = false;

/**
 * Loads Google Analytics (gtag.js) at most once for the page's lifetime and
 * initializes it with automatic page_view sends disabled, since this is a
 * single-page app - see trackPageview for the per-route send instead.
 * Wrapped in try/catch so an ad/tracker blocker, CSP restriction, or network
 * failure can never break the rest of the app.
 */
export function ensureAnalyticsScript(measurementId: string): void {
  if (scriptRequested || document.getElementById(ANALYTICS_SCRIPT_ID)) {
    scriptRequested = true;
    return;
  }
  scriptRequested = true;

  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });

    const script = document.createElement('script');
    script.id = ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  } catch {
    // Blocked or unavailable - the rest of the app is unaffected.
  }
}

/** Sends a page_view for the given route. Safe to call even if the script above failed to load. */
export function trackPageview(path: string): void {
  try {
    window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  } catch {
    // Blocked or unavailable - navigation is unaffected.
  }
}
