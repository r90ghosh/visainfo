import Link from 'next/link';
import AnimatedBackground from '../../src/components/AnimatedBackground';
import Footer from '../../src/components/Footer';
import '../../src/components/ResultsPanel.css';
import './visa.css';

export default function VisaLayout({ children }) {
  return (
    <>
      <AnimatedBackground />
      <div className="app">
        <div className="visa-topbar">
          <div className="visa-topbar-inner">
            <Link href="/" className="visa-topbar-brand">
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="26" stroke="#d4a853" strokeWidth="1.8" />
                <ellipse cx="32" cy="32" rx="14" ry="26" stroke="#d4a853" strokeWidth="1.3" opacity="0.7" />
                <path d="M6 32 Q32 28 58 32" stroke="#d4a853" strokeWidth="1" opacity="0.5" fill="none" />
                <path d="M18 40 Q28 18 46 22" stroke="#e8c87a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="46" cy="22" r="4" fill="#e8c87a" />
                <circle cx="46" cy="22" r="1.5" fill="#0f0d0a" />
                <circle cx="18" cy="40" r="2.5" fill="#d4a853" opacity="0.6" />
              </svg>
              visainfo.ai
            </Link>
          </div>
        </div>
        <div className="app-content visa-content">{children}</div>
        <Footer />
      </div>
    </>
  );
}
