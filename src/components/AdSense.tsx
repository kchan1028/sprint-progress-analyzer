import { useEffect, useRef } from 'react';

interface AdSenseProps {
  /** Ad-unit slot ID from the AdSense dashboard for this specific placement. */
  slot?: string;
  label?: string;
  className?: string;
}

/**
 * A single, reusable AdSense ad slot. Renders nothing in production unless
 * both the publisher client ID (VITE_ADSENSE_CLIENT_ID) and a slot ID for
 * this placement are configured - an unconfigured or blocked ad never
 * breaks the surrounding page. Only ever passes AdSense's own
 * client/slot identifiers to Google; no Jira, sprint, or locally stored
 * application data is included.
 */
export function AdSense({ slot, label = 'Advertisement', className }: AdSenseProps) {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const isProd = import.meta.env.PROD;
  const canRenderRealAd = isProd && Boolean(clientId) && Boolean(slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!canRenderRealAd || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense unavailable or blocked - the rest of the app is unaffected.
    }
  }, [canRenderRealAd]);

  // In production, an unconfigured placement renders nothing at all (no
  // label, no placeholder) rather than an empty ad box.
  if (isProd && !canRenderRealAd) {
    return null;
  }

  return (
    <div className={`adsense ${className ?? ''}`}>
      <span className="adsense__label">{label}</span>
      {canRenderRealAd ? (
        <ins
          className="adsbygoogle adsense__unit"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="adsense__placeholder" aria-hidden="true">
          Ad slot (shown in production once configured)
        </div>
      )}
    </div>
  );
}
