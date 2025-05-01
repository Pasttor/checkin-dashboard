// components/QrScanner.tsx
import { useEffect } from 'react';
import type { Html5Qrcode } from 'html5-qrcode';
import styles from './QrScanner.module.css';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (typeof window !== 'undefined') {
      import('html5-qrcode')
        .then(({ Html5Qrcode: Qr }) => {
          html5QrCode = new Qr('qr-reader');
          return html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            // Callback de éxito: anotamos el tipo
            (decodedText: string) => {
              onScan(decodedText);
              html5QrCode?.stop().catch(console.error);
            },
            // Callback de error de escaneo intermedio: anotamos el tipo
            (errorMessage: string) => {
              // aquí podrías loggear errorMessage si quisieras
            }
          );
        })
        .catch((err: unknown) => {
          console.error('No se pudo cargar html5-qrcode:', err);
        });
    }

    return () => {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .then(() => html5QrCode?.clear())
          .catch(console.error);
      }
    };
  }, [onScan]);

  return <div id="qr-reader" className={styles.reader} />;
}

