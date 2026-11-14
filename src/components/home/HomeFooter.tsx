import { Link } from 'react-router-dom';

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <span className="home-footer__attribution">
          © {new Date().getFullYear()} Sprint Progress Analyzer
          <span className="home-footer__divider" aria-hidden="true">·</span>
          <a href="https://yippify.com/" target="_blank" rel="noopener noreferrer">
            Built by Yippify
          </a>
        </span>
        <nav className="home-footer__nav" aria-label="Footer">
          <Link to="/analyze">Analyze</Link>
          <Link to="/dashboard">Dashboard</Link>
          <a href="#privacy">Privacy</a>
          <a href="#disclaimer">Disclaimer</a>
        </nav>
      </div>
    </footer>
  );
}
