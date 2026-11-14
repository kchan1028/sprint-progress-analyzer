import { Link } from 'react-router-dom';

export function FinalCta() {
  return (
    <section className="final-cta">
      <h2 className="final-cta__heading">Understand your sprint in minutes.</h2>
      <Link to="/analyze" className="btn btn--primary btn--lg">
        Analyze Your Sprint
      </Link>
    </section>
  );
}
