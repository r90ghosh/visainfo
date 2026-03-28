import Select from 'react-select';
import countries from '../data/countries';

const defaultStyles = {
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
};

function formatOptionLabel({ flag, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '1.2em' }}>{flag}</span>
      <span>{label}</span>
    </span>
  );
}

function CountrySelect({ value, onChange, placeholder, styles }) {
  return (
    <Select
      options={countries}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      formatOptionLabel={formatOptionLabel}
      isSearchable
      isClearable
      styles={styles || defaultStyles}
    />
  );
}

export default CountrySelect;
