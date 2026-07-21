import './ResultsPanel.css';

const BADGE_CLASSES = {
  visa_free: 'badge-visa-free',
  eta: 'badge-eta',
  e_visa: 'badge-e-visa',
  visa_on_arrival: 'badge-voa',
  visa_required: 'badge-visa-required',
  long_stay: 'badge-long-stay',
  no_admission: 'badge-no-admission',
  unknown: 'badge-unknown',
};

function ResultsPanel({ results }) {
  const {
    requirementCategory,
    requirementLabel,
    requirementDescription,
    maxStayDays,
    waiver,
    shortStayNote,
    visaType,
    embassyInfo,
    embassyDirectoryUrl,
    applicationFormUrl,
    applicationCost,
    processingTime,
    additionalNotes,
  } = results;

  const badgeClass = BADGE_CLASSES[requirementCategory] || 'badge-unknown';

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
        {/* Visa Requirement */}
        <div className="result-card result-card--full">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Visa Requirement
          </h3>
          <span className={`badge ${badgeClass}`}>{requirementLabel}</span>
          {requirementDescription && (
            <p className="result-card-subtext">{requirementDescription}</p>
          )}
          {maxStayDays != null && (
            <p className="result-card-subtext">Stay up to {maxStayDays} days</p>
          )}
          {waiver && (
            <div className="waiver-note">
              Because you hold a {waiver.heldVisa} visa: {waiver.conditions}
            </div>
          )}
          {shortStayNote && <p className="result-card-note">{shortStayNote}</p>}
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
              {embassyInfo.address && (
                <p className="result-card-text embassy-address">{embassyInfo.address}</p>
              )}
            </>
          ) : (
            <p className="result-card-text">Not available</p>
          )}
          {embassyDirectoryUrl && (
            <a
              href={embassyDirectoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link embassy-directory-link"
            >
              <svg className="result-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Find on EmbassyPages
            </a>
          )}
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

        {/* Typical Processing Time */}
        <div className="result-card">
          <h3 className="result-card-title">
            <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Typical Processing Time
          </h3>
          <p className="result-wait">{processingTime || 'Not available'}</p>
        </div>

        {additionalNotes && (
          <div className="result-card result-card--full">
            <h3 className="result-card-title">
              <svg className="result-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Additional Notes
            </h3>
            <p className="result-card-text">{additionalNotes}</p>
          </div>
        )}
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
