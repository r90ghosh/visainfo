import Link from 'next/link';
import AnimatedBackground from '../src/components/AnimatedBackground';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />
      <div className="app">
        <Header />
        <div className="app-content not-found-content">
          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-text">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="submit-btn not-found-link">
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    </>
  );
}
