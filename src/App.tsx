import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { AppShell } from './components/AppShell';
import { ensureAdSenseScript } from './utils/adsense';
import { ensureAnalyticsScript, trackPageview } from './utils/analytics';

export function App() {
  const location = useLocation();

  useEffect(() => {
    // Real ads only in production, and only when this app's own AdSense
    // client ID is configured - loaded once for the whole SPA lifetime.
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
    if (import.meta.env.PROD && clientId) {
      ensureAdSenseScript(clientId);
    }
  }, []);

  useEffect(() => {
    // Same production-only gating as AdSense above - loaded once for the
    // whole SPA lifetime, only when this app's own measurement ID is set.
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (import.meta.env.PROD && measurementId) {
      ensureAnalyticsScript(measurementId);
    }
  }, []);

  useEffect(() => {
    // Manual page_view per route change - send_page_view is disabled in
    // ensureAnalyticsScript so this is the only place page views are sent.
    if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID) {
      trackPageview(location.pathname);
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/analyze"
        element={
          <AppShell>
            {/* Explicit key forces a remount when navigating from /dashboard, so
                ImportPanel's open/closed state doesn't leak across routes. */}
            <DashboardPage
              key="analyze"
              defaultImportOpen
              pageTitle="Import & Analyze Your Sprint — Sprint Progress Analyzer"
            />
          </AppShell>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <DashboardPage key="dashboard" pageTitle="Sprint Dashboard — Sprint Progress Analyzer" />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
