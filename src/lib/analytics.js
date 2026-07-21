const MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

let scriptInjected = false;

function ensureLoaded() {
  if (scriptInjected) return;
  scriptInjected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);
}

export function trackEvent(name, params = {}) {
  if (!MEASUREMENT_ID) return;
  ensureLoaded();
  window.gtag('event', name, params);
}
