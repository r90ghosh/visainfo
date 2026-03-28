import './ResultsPanel.css';

function ResultsPanel({ results }) {
  const {
    visaRequired,
    visaType,
    embassyInfo,
    applicationFormUrl,
    applicationCost,
    currentWaitTime,
  } = results;

  return (
    <div className="results-panel">
      <div className="results-header">
        <svg className="results-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 className="results-header-title">Your visa results</h2>
      </div>

      <div className="results-grid">
        {/* Visa Required */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Visa Required?
          </h3>
          <span
            className={`badge ${visaRequired === 'Yes' ? 'badge-required' : 'badge-not-required'}`}
          >
            {visaRequired === 'Yes' ? (
              <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {visaRequired}
          </span>
        </div>

        {/* Visa Type */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Visa Type
          </h3>
          <p className="result-card-text">{visaType || 'N/A'}</p>
        </div>

        {/* Embassy Information */}
        <div className="result-card result-card--full">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Embassy Information
          </h3>
          {embassyInfo ? (
            <>
              <p className="result-card-text embassy-name">{embassyInfo.name}</p>
              <p className="result-card-text embassy-address">
                {embassyInfo.address}
              </p>
            </>
          ) : (
            <p className="result-card-text">Not available</p>
          )}
        </div>

        {/* Application Form */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Application Form
          </h3>
          {applicationFormUrl && applicationFormUrl.startsWith('http') ? (
            <a
              href={applicationFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link"
            >
              <svg className="result-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Application
            </a>
          ) : (
            <p className="result-card-text">{applicationFormUrl || 'Not available'}</p>
          )}
        </div>

        {/* Application Cost */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Application Cost
          </h3>
          <p className="result-cost">{applicationCost || 'Not available'}</p>
        </div>

        {/* Wait Time */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Estimated Wait Time
          </h3>
          <p className="result-wait">
            {currentWaitTime || 'Not available'}
          </p>
        </div>

        {/* Processing Time */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Processing Time
          </h3>
          <p className="result-card-text">
            {results.processingTime || 'Varies by application'}
          </p>
        </div>
      </div>

      <div className="results-footer">
        <div className="disclaimer">
          <svg className="disclaimer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            This information is AI-generated and may not reflect current requirements.
            Always verify with official embassy or consulate sources before making travel plans.
          </span>
        </div>
        <a
          href="https://www.embassypages.com"
          target="_blank"
          rel="noopener noreferrer"
          className="embassy-link"
        >
          Visit EmbassyPages.com for official embassy directories
        </a>
      </div>
    </div>
  );
}

export default ResultsPanel;
