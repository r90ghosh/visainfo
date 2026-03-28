import Select from 'react-select';
import CountrySelect from './CountrySelect';
import './VisaForm.css';

const travelReasonOptions = [
  { value: 'tourism', label: 'Tourism' },
  { value: 'student', label: 'Student' },
  { value: 'work_business', label: 'Work/Business' },
];

const currentVisaOptions = [
  { value: 'na', label: 'N/A' },
  { value: 'united_states', label: 'United States' },
  { value: 'schengen', label: 'Schengen (EU)' },
  { value: 'united_kingdom', label: 'United Kingdom' },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: state.isFocused
      ? 'rgba(255, 245, 230, 0.08)'
      : 'rgba(255, 245, 230, 0.06)',
    borderColor: state.isFocused
      ? 'rgba(212, 168, 83, 0.5)'
      : 'rgba(255, 215, 150, 0.12)',
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(212, 168, 83, 0.15), 0 0 20px rgba(212, 168, 83, 0.1)'
      : 'none',
    borderRadius: 12,
    padding: '2px 4px',
    fontSize: '0.925rem',
    color: '#fff8ee',
    minHeight: 44,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: state.isFocused
        ? 'rgba(212, 168, 83, 0.5)'
        : 'rgba(255, 215, 150, 0.2)',
    },
  }),
  menu: (base) => ({
    ...base,
    background: 'rgba(15, 13, 10, 0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(255, 215, 150, 0.1)',
    boxShadow:
      '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 32px rgba(212, 168, 83, 0.1)',
    zIndex: 20,
  }),
  menuList: (base) => ({
    ...base,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgba(212, 168, 83, 0.35)'
      : state.isFocused
      ? 'rgba(212, 168, 83, 0.15)'
      : 'transparent',
    color: '#fff8ee',
    fontSize: '0.925rem',
    cursor: 'pointer',
    borderRadius: 8,
    padding: '10px 12px',
    transition: 'background-color 0.15s ease',
    '&:active': {
      backgroundColor: 'rgba(212, 168, 83, 0.3)',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgba(255, 248, 238, 0.35)',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff8ee',
  }),
  input: (base) => ({
    ...base,
    color: '#fff8ee',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(212, 168, 83, 0.2)',
    borderRadius: 8,
    border: '1px solid rgba(212, 168, 83, 0.3)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'rgb(232, 200, 122)',
    fontWeight: 500,
    fontSize: '0.85rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(232, 200, 122)',
    borderRadius: '0 8px 8px 0',
    '&:hover': {
      backgroundColor: 'rgba(212, 168, 83, 0.35)',
      color: '#fff8ee',
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'rgba(255, 215, 150, 0.1)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'rgba(255, 248, 238, 0.35)',
    '&:hover': {
      color: 'rgba(255, 248, 238, 0.6)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgba(255, 248, 238, 0.35)',
    '&:hover': {
      color: 'rgba(255, 248, 238, 0.6)',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgba(255, 248, 238, 0.4)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

function VisaForm({ formData, onChange, onSubmit, loading }) {
  const isDisabled =
    loading ||
    !formData.residentCountry ||
    !formData.nationalityCountry ||
    !formData.destinationCountry ||
    !formData.travelReason;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDisabled) {
      onSubmit();
    }
  };

  return (
    <div className="glow-container">
      <span className="glow"></span>
    <form className="visa-form glow-content" id="form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2 className="form-title">
          <svg className="form-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Check visa requirements
        </h2>
        <p className="form-subtitle">Fill in your travel details to get AI-powered guidance</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <svg className="form-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Resident Country
            <span className="form-label-required">*</span>
          </label>
          <CountrySelect
            value={formData.residentCountry}
            onChange={(val) => onChange('residentCountry', val)}
            placeholder="Where you live..."
            styles={selectStyles}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <svg className="form-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Nationality
            <span className="form-label-required">*</span>
          </label>
          <CountrySelect
            value={formData.nationalityCountry}
            onChange={(val) => onChange('nationalityCountry', val)}
            placeholder="Your passport country..."
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <svg className="form-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Destination Country
          <span className="form-label-required">*</span>
        </label>
        <CountrySelect
          value={formData.destinationCountry}
          onChange={(val) => onChange('destinationCountry', val)}
          placeholder="Where are you traveling to?"
          styles={selectStyles}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <svg className="form-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Reason for Travel
            <span className="form-label-required">*</span>
          </label>
          <Select
            options={travelReasonOptions}
            value={formData.travelReason}
            onChange={(val) => onChange('travelReason', val)}
            placeholder="Purpose of trip..."
            isSearchable={false}
            isClearable
            styles={selectStyles}
            menuPortalTarget={document.body}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <svg className="form-label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Current visas held
          </label>
          <Select
            options={currentVisaOptions}
            value={formData.currentVisas}
            onChange={(val) => onChange('currentVisas', val)}
            placeholder="Select if applicable..."
            isMulti
            isClearable
            styles={selectStyles}
            menuPortalTarget={document.body}
          />
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={isDisabled}
      >
        {loading ? (
          <>
            <svg className="submit-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Searching...
          </>
        ) : (
          <>
            <svg className="submit-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            Find Visa Requirements
          </>
        )}
      </button>
    </form>
    </div>
  );
}

export default VisaForm;
