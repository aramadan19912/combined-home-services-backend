import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { initSentry } from './sentry'
import { initAnalytics } from './lib/analytics'
import { getConfig } from './lib/config'
import './i18n'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize monitoring/analytics based on runtime config
const cfg = getConfig();
initSentry();
initAnalytics(cfg.gaMeasurementId);

createRoot(document.getElementById("root")!).render(<App />);
