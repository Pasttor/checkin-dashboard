// components/QrScanner.tsx

import { useEffect } from 'react';
import type { Html5Qrcode } from 'html5-qrcode';
import styles from './QrScanner.module.css';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let html5QrCode: Html5Qrcode | null = null;
    let scannerStarted = false;

    import('html5-qrcode')
      .then(({ Html5Qrcode: QrClass }) => {
        html5QrCode = new QrClass('qr-reader');

        return html5QrCode
          .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 260, height: 260 } },
            (decodedText) => {
              onScan(decodedText);
            },
            (_errorMessage) => {
              // lecturas fallidas intermedias: ignoramos
            }
          )
          .then(() => {
            scannerStarted = true;
          });
      })
      .catch((err) => {
        console.error('No se pudo inicializar html5-qrcode:', err);
      });

    return () => {
      if (!html5QrCode) return;

      if (scannerStarted) {
        // Si arrancó, detenemos primero y luego limpiamos
        html5QrCode
          .stop()
          .then(() => {
            try {
              html5QrCode?.clear();
            } catch (cleErr) {
              console.warn('Error al limpiar html5-qr:', cleErr);
            }
          })
          .catch((stopErr) => {
            console.warn('No se pudo detener el escáner:', stopErr);
            // aunque no se detenga, intentamos limpiar
            try {
              html5QrCode?.clear();
            } catch (cleErr) {
              console.warn('Error al limpiar tras stop fallido:', cleErr);
            }
          });
      } else {
        // Si nunca arrancó, sólo limpiamos
        try {
          html5QrCode.clear();
        } catch (cleErr) {
          console.warn('Error al limpiar html5-qr antes de iniciar:', cleErr);
        }
      }
    };
  }, [onScan]);

  return <div id="qr-reader" className={styles.reader} />;
}
