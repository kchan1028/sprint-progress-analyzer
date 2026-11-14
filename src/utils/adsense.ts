const ADSENSE_SCRIPT_ID = 'adsbygoogle-script';

let scriptRequested = false;

/**
 * Loads Google's AdSense script at most once for the page's lifetime.
 * Safe to call from multiple places - subsequent calls are no-ops. Wrapped
 * in try/catch so an ad blocker, CSP restriction, or network failure can
 * never break the rest of the app; a failed/blocked load just means no ads
 * render, which the AdSense component already handles gracefully.
 */
export function ensureAdSenseScript(clientId: string): void {
  // Advertising remains disabled for this portfolio project.
  const advertisingEnabled = false;
  if (!advertisingEnabled) return;
  if (scriptRequested || document.getElementById(ADSENSE_SCRIPT_ID)) {
    scriptRequested = true;
    return;
  }
  scriptRequested = true;

  try {
    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    document.head.appendChild(script);
  } catch {
    // Ad blocker, CSP, or other failure - the rest of the app is unaffected.
  }
}
