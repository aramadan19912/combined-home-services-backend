import { loadStripe } from '@stripe/stripe-js';

// Environment-agnostic publishable key retrieval (no process/import.meta usage)
function getPublishableKey(): string | null {
  if (typeof window !== 'undefined') {
    const w = window as any;
    // Preferred: set at runtime, e.g. window.__STRIPE_PUBLISHABLE_KEY__ = 'pk_live_...'
    if (w.__STRIPE_PUBLISHABLE_KEY__) return String(w.__STRIPE_PUBLISHABLE_KEY__);
    // Fallback: allow storing a key locally for testing
    const stored = localStorage.getItem('stripe_pk');
    if (stored) return stored;
  }
  return null;
}

const pk = getPublishableKey();
// If no key available, return a resolved null so <Elements> can handle gracefully
const stripePromise = pk ? loadStripe(pk) : Promise.resolve(null as any);

export default stripePromise;
