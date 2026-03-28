import { useState, useRef } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import VisaForm from './components/VisaForm';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';
import './App.css';

const initialFormData = {
  residentCountry: null,
  nationalityCountry: null,
  destinationCountry: null,
  travelReason: null,
  currentVisas: [],
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const payload = {
        residentCountry: formData.residentCountry?.value,
        nationalityCountry: formData.nationalityCountry?.value,
        destinationCountry: formData.destinationCountry?.value,
        travelReason: formData.travelReason?.label,
        currentVisas: (formData.currentVisas || []).map((v) => v.label),
        residentCountryName: formData.residentCountry?.label,
        nationalityCountryName: formData.nationalityCountry?.label,
        destinationCountryName: formData.destinationCountry?.label,
      };

      const response = await fetch('/.netlify/functions/visa-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setResults(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="app">
        <Header />

        <div className="app-content">
          <VisaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {loading && <LoadingSpinner />}

          {error && !loading && <ErrorMessage message={error} />}

          {results && !loading && (
            <div ref={resultsRef}>
              <ResultsPanel results={results} />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default App;
