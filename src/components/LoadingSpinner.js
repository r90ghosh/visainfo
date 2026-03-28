import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner-rings">
        <div className="spinner-ring spinner-ring--outer" />
        <div className="spinner-ring spinner-ring--middle" />
        <div className="spinner-ring spinner-ring--inner" />
      </div>
      <p className="loading-text">Finding your visa path...</p>
      <p className="loading-subtext">This may take a few seconds</p>
    </div>
  );
}

export default LoadingSpinner;
