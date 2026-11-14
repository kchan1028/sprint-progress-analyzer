import { Link } from 'react-router-dom';

/** Small, static preview reusing the real dashboard's card styles - illustrative, not live data. */
function HeroPreview() {
  return (
    <div className="hero-preview" aria-hidden="true">
      <div className="hero-preview__label">Example sprint snapshot</div>
      <div className="hero-preview__kpis">
        <div className="card kpi-card">
          <div className="kpi-card__value">94</div>
          <div className="kpi-card__label">Current Scope</div>
          <div className="kpi-card__context">story points</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-card__value">53</div>
          <div className="kpi-card__label">Completed</div>
          <div className="kpi-card__context">story points</div>
        </div>
        <div className="card kpi-card kpi-card--danger">
          <div className="kpi-card__value">11</div>
          <div className="kpi-card__label">Blocked</div>
          <div className="kpi-card__context">story points stuck</div>
        </div>
      </div>
      <div className="signal signal--warning hero-preview__signal">
        <span className="signal__icon">⚠</span>
        <div className="signal__body">
          <div className="signal__top-row">
            <span className="signal__severity-tag">Warning</span>
            <span className="signal__headline">17 SP added after sprint started</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__headline">Know if your sprint is on track — before the last day.</h1>
        <p className="hero__subhead">
          Sprint Progress Analyzer turns your Jira sprint data into a clear view of delivery progress,
          scope changes, workflow bottlenecks, and sprint risk — so you find out on day three, not day ten.
        </p>
        <div className="hero__actions">
          <Link to="/analyze" className="btn btn--primary btn--lg">
            Analyze Your Sprint
          </Link>
          <a href="#how-it-works" className="btn btn--secondary btn--lg">
            See How It Works
          </a>
        </div>
        <p className="hero__trust-note">
          No Jira account connection required · Your data stays in your browser
        </p>
      </div>
      <HeroPreview />
    </section>
  );
}
