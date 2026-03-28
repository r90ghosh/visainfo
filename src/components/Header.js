import './Header.css';

function Header() {
  return (
    <header className="hero">
      {/* Floating particles */}
      <div className="hero-particles">
        <span className="particle particle--1" />
        <span className="particle particle--2" />
        <span className="particle particle--3" />
        <span className="particle particle--4" />
        <span className="particle particle--5" />
        <span className="particle particle--6" />
        <span className="particle particle--7" />
        <span className="particle particle--8" />
        <span className="particle particle--9" />
        <span className="particle particle--10" />
      </div>

      <div className="hero-inner">
        {/* Nav */}
        <nav className="hero-nav">
          <div className="hero-brand">
            <span className="hero-brand-name">visainfo.ai</span>
          </div>
          <div className="hero-nav-pill">
            <span className="hero-nav-pill-dot" />
            Powered by AI
          </div>
        </nav>

        {/* Eyebrow */}
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-text">IMMIGRATION MADE SIMPLE</span>
          <span className="hero-eyebrow-line" />
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          Find your{' '}
          <span className="hero-headline-gradient">ideal visa path</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          powered by one of the most intelligent AI models
        </p>

        {/* Description */}
        <p className="hero-description">
          Get instant visa requirements, embassy details, application costs,
          and processing times for 195+ countries
        </p>

        {/* Stat cards */}
        <div className="hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="hero-stat-number">195+</span>
            <span className="hero-stat-label">Countries</span>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon hero-stat-icon--cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="hero-stat-number">Instant</span>
            <span className="hero-stat-label">Results</span>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon hero-stat-icon--purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
              </svg>
            </div>
            <span className="hero-stat-number">AI-Powered</span>
            <span className="hero-stat-label">Intelligence</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
