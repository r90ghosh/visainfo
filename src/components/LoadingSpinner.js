import './LoadingSpinner.css';

const STAGE_TEXT = {
  requirement: 'Checking passport index data…',
  details: 'Fetching embassy and application details…',
};

function LoadingSpinner({ stage = 'requirement' }) {
  return (
    <div className="loading-container">
      <div className="spinner-rings">
        <div className="spinner-ring spinner-ring--outer" />
        <div className="spinner-ring spinner-ring--middle" />
        <div className="spinner-ring spinner-ring--inner" />
      </div>
      <p className="loading-text">{STAGE_TEXT[stage] || STAGE_TEXT.requirement}</p>
      <p className="loading-subtext">This may take a few seconds</p>
    </div>
  );
}

export default LoadingSpinner;
