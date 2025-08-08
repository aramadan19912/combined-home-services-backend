let initialized = false;

export function initAnalytics(measurementId?: string) {
  if (initialized || !measurementId || typeof window === 'undefined') return;
  // Inject gtag script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { send_page_view: false });
  `;
  document.head.appendChild(script2);

  initialized = true;
}

export function trackPageview(path: string) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.gtag) {
    w.gtag('event', 'page_view', { page_path: path });
  }
}
