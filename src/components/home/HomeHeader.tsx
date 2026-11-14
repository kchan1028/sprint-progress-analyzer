import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

export function HomeHeader() {
  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-header__brand">
          Sprint Progress Analyzer
        </Link>
        <nav className="home-header__nav" aria-label="Primary">
          <a href="#how-it-works" className="home-header__link">How It Works</a>
          <a href="#signals" className="home-header__link">Signals</a>
          <a href="#who-its-for" className="home-header__link">Who It's For</a>
          <a href="#privacy" className="home-header__link">Privacy</a>
        </nav>
        <div className="home-header__actions">
          <ThemeToggle />
          <Link to="/analyze" className="btn btn--primary btn--sm">
            <span className="btn__text-full">Analyze Your Sprint</span>
            <span className="btn__text-short">Analyze</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
