import { useState, useRef, useEffect, useCallback } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import VisaForm from './components/VisaForm';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';
import countries from './data/countries';
import { travelReasonOptions, currentVisaOptions } from './data/formOptions';
import { trackEvent } from './lib/analytics';
import './App.css';

const initialFormData = {
  residentCountry: null,
  nationalityCountry: null,
  destinationCountry: null,
  travelReason: null,
  currentVisas: [],
};

function buildPayload(formData) {
  return {
    residentCountry: formData.residentCountry?.value,
    nationalityCountry: formData.nationalityCountry?.value,
    destinationCountry: formData.destinationCountry?.value,
    travelReason: formData.travelReason?.label,
    currentVisas: (formData.currentVisas || []).map((v) => v.value),
    residentCountryName: formData.residentCountry?.label,
    nationalityCountryName: formData.nationalityCountry?.label,
    destinationCountryName: formData.destinationCountry?.label,
  };
}

function buildQueryParams(formData) {
  const params = new URLSearchParams();
  params.set('res', formData.residentCountry.value);
  params.set('nat', formData.nationalityCountry.value);
  params.set('to', formData.destinationCountry.value);
  params.set('reason', formData.travelReason.value);
  const visas = (formData.currentVisas || []).map((v) => v.value);
  if (visas.length) params.set('visas', visas.join(','));
  return params;
}

function parsePrefillFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const res = params.get('res');
  const nat = params.get('nat');
  const to = params.get('to');
  const reason = params.get('reason');
  const visasParam = params.get('visas');

  if (!res || !nat || !to || !reason) return null;

  const residentCountry = countries.find((c) => c.value === res);
  const nationalityCountry = countries.find((c) => c.value === nat);
  const destinationCountry = countries.find((c) => c.value === to);
  const travelReason = travelReasonOptions.find((r) => r.value === reason);
  if (!residentCountry || !nationalityCountry || !destinationCountry || !travelReason) {
    return null;
  }

  const currentVisas = visasParam
    ? visasParam
        .split(',')
        .map((v) => currentVisaOptions.find((o) => o.value === v))
        .filter(Boolean)
    : [];

  return { residentCountry, nationalityCountry, destinationCountry, travelReason, currentVisas };
}

async function requestPhase(payload, phase) {
  return fetch('/.netlify/functions/visa-lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, phase }),
  });
}

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('requirement');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackQuery, setFeedbackQuery] = useState(null);
  const resultsRef = useRef(null);
  const payloadRef = useRef(null);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchDetails = useCallback(async (payload) => {
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const response = await requestPhase(payload, 'details');
      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
      if (!response.ok) {
        throw new Error('FAILED');
      }
      const data = await response.json();
      if (data.aiError) {
        throw new Error('FAILED');
      }
      setResults((prev) => (prev ? { ...prev, ...data } : data));
    } catch (err) {
      trackEvent('lookup_details_failed', {
        route: `${payload.nationalityCountry}-${payload.destinationCountry}`,
      });
      setDetailsError(
        err.message === 'RATE_LIMITED'
          ? 'Too many requests — try again in a bit.'
          : "AI details couldn't be loaded."
      );
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const runLookup = useCallback(
    async (data) => {
      const payload = buildPayload(data);
      payloadRef.current = payload;
      setFeedbackQuery({
        nationality: payload.nationalityCountry,
        destination: payload.destinationCountry,
        reason: data.travelReason?.value,
      });
      setLoading(true);
      setLoadingStage('requirement');
      setResults(null);
      setError(null);
      setDetailsError(null);

      try {
        const response = await requestPhase(payload, 'requirement');
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || `Request failed with status ${response.status}`
          );
        }

        const requirementData = await response.json();
        setResults(requirementData);
        setLoading(false);

        trackEvent('visa_lookup', {
          route: `${payload.nationalityCountry}-${payload.destinationCountry}`,
          reason: data.travelReason?.value,
        });

        const params = buildQueryParams(data);
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        if (!requirementData.complete) {
          setLoadingStage('details');
          fetchDetails(payload);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    },
    [fetchDetails]
  );

  const handleSubmit = () => runLookup(formData);

  const handleRetryDetails = () => {
    if (payloadRef.current) fetchDetails(payloadRef.current);
  };

  const handleFeedback = (verdict) => {
    if (!feedbackQuery) return;
    trackEvent('feedback', {
      route: `${feedbackQuery.nationality}-${feedbackQuery.destination}`,
      verdict,
    });
    fetch('/.netlify/functions/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...feedbackQuery, verdict }),
    }).catch(() => {});
  };

  useEffect(() => {
    const prefill = parsePrefillFromUrl();
    if (!prefill) return;
    setFormData(prefill);
    runLookup(prefill);
    // Intentionally run only once on mount to auto-prefill from a shared URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          {loading && <LoadingSpinner stage={loadingStage} />}

          {error && !loading && <ErrorMessage message={error} />}

          {results && !loading && (
            <div ref={resultsRef}>
              <ResultsPanel
                results={results}
                detailsLoading={detailsLoading}
                detailsError={detailsError}
                onRetryDetails={handleRetryDetails}
                query={feedbackQuery}
                onFeedback={handleFeedback}
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default App;
