// pages/_app.tsx

import type { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.addEventListener('error', (event) => {
      console.error('🔴 Global error event:', event.error || event.message, event);
    });
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🔴 Unhandled promise rejection:', event.reason, event);
    });
  }, []);

  return <Component {...pageProps} />;
}
