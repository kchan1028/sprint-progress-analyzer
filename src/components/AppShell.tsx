import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

/**
 * Shared chrome for the app routes (/analyze, /dashboard) - distinct from
 * the public homepage (/), which has its own marketing header/footer.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to dashboard content</a>
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          <div className="app-header__title">Sprint Progress Analyzer</div>
          <div className="app-header__subtitle">Are we on track, and what's putting the sprint at risk?</div>
        </Link>
        <nav className="app-header__nav">
          <NavLink to="/analyze" className={({ isActive }) => `app-header__link ${isActive ? 'app-header__link--active' : ''}`}>
            Analyze
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `app-header__link ${isActive ? 'app-header__link--active' : ''}`}>
            Dashboard
          </NavLink>
          <ThemeToggle />
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="app-shell__footer">
        Your Jira data stays in your browser - we don't store your sprint data on our servers.
      </footer>
    </div>
  );
}
