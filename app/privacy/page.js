import Link from 'next/link';
import './privacy.css';

export const metadata = {
  title: 'Privacy Policy — VisaInfo.ai',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <Link href="/" className="privacy-back-link">
        &larr; Back to VisaInfo.ai
      </Link>

      <h1 className="privacy-title">Privacy Policy</h1>
      <p className="privacy-updated">VisaInfo.ai</p>

      <h2>What we collect</h2>
      <p>
        When you use the visa lookup form, the resident country, nationality, destination,
        travel reason, and any current visas you enter are processed solely to answer your
        query. This information is not linked to your identity and no account or personal
        profile is created or stored.
      </p>

      <h2>How queries are processed</h2>
      <p>
        Visa lookup queries are sent to Google&apos;s Gemini API to generate embassy, application,
        and processing details. Google&apos;s own privacy policy governs how that API processes
        the data it receives.
      </p>

      <h2>Analytics</h2>
      <p>
        We may collect anonymous usage analytics (such as page views and lookups performed)
        to understand how the tool is used and to improve it. This data is not tied to your
        identity.
      </p>

      <h2>Accuracy feedback</h2>
      <p>
        If you use the thumbs up / thumbs down feedback on a result, we store an anonymous
        record of the route, travel reason, and your verdict to help us improve accuracy over
        time. This feedback is not linked to your identity.
      </p>

      <h2>No accounts, no data sales</h2>
      <ul>
        <li>VisaInfo.ai does not require or offer user accounts.</li>
        <li>We do not sell or share your data with third parties for marketing purposes.</li>
      </ul>

      <div className="privacy-contact">
        Questions about this policy? Contact us at{' '}
        <a href="mailto:contact@visainfo.ai">contact@visainfo.ai</a>.
      </div>
    </div>
  );
}
