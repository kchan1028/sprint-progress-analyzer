import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { AdSense } from '../components/AdSense';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeHero } from '../components/home/HomeHero';
import { FeatureOverview } from '../components/home/FeatureOverview';
import { HowItWorks } from '../components/home/HowItWorks';
import { SignalsExplained } from '../components/home/SignalsExplained';
import { AudienceSection } from '../components/home/AudienceSection';
import { WhyNotJira } from '../components/home/WhyNotJira';
import { PrivacySection } from '../components/home/PrivacySection';
import { FinalCta } from '../components/home/FinalCta';
import { Disclaimer } from '../components/home/Disclaimer';
import { HomeFooter } from '../components/home/HomeFooter';

const PAGE_TITLE = 'Sprint Progress Analyzer — Jira Sprint Health & Delivery Risk Analysis';
const PAGE_DESCRIPTION =
  'Analyze Jira sprint progress, scope changes, workflow bottlenecks, code review, testing, blocked work, and delivery risk signals in one engineering leadership dashboard.';

/** Public, SEO-facing marketing page at "/". Kept separate from the app's own routes (/analyze, /dashboard). */
export function HomePage() {
  useDocumentMeta({ title: PAGE_TITLE, description: PAGE_DESCRIPTION });

  return (
    <div className="home">
      <HomeHeader />
      <main>
        <HomeHero />
        <FeatureOverview />
        <HowItWorks />
        <SignalsExplained />
        <AudienceSection />
        <WhyNotJira />
        <PrivacySection />
        <FinalCta />

        {/* After all informational content, ahead of the legal footer material. */}
        <AdSense slot={import.meta.env.VITE_ADSENSE_SLOT_HOME} />

        <Disclaimer />
      </main>
      <HomeFooter />
    </div>
  );
}
