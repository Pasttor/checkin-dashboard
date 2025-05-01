import { useEffect } from 'react';
import type { Html5Qrcode } from 'html5-qrcode';
import styles from './QrScanner.module.css';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let cancelled = false;

    if (typeof window !== 'undefined') {
      import('html5-qrcode')
        .then(({ Html5Qrcode: QrClass }) => {
          if (cancelled) return;
          html5QrCode = new QrClass('qr-reader');

          html5QrCode
            .start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText: string) => {
                // Sólo notificamos el scan, no paramos aquí
                onScan(decodedText);
              },
              (_errorMessage: string) => {
                // lecturas fallidas intermedias: ignoramos
              }
            )
            .catch(err => {
              console.error('QR start failed:', err);
            });
        })
        .catch(err => {
          console.error('Failed to import html5-qrcode:', err);
        });
    }

    return () => {
      cancelled = true;
      // Paramos siempre en el cleanup
      html5QrCode
        ?.stop()
        .then(() => html5QrCode?.clear())
        .catch(err => {
          console.warn('QR cleanup stop error (ignored):', err);
        });
    };
  }, [onScan]);

  return <div id="qr-reader" className={styles.reader} />;
}
