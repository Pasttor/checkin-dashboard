// components/QrScanner.tsx
import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  useEffect(() => {
    // Solo en cliente
    if (typeof window === 'undefined') return;

    const regionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(regionId);

    html5QrCode
      .start(
        { facingMode: 'environment' },   // cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        decodedText => {
          onScan(decodedText);
          html5QrCode.stop();           // detiene la cámara tras el primer escaneo
        },
        errorMsg => {
          // fallos de lectura intermedios: se ignoran
        }
      )
      .catch(err => {
        console.error('No se pudo iniciar el escáner de QR:', err);
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(err => console.error('Error parando el escáner:', err));
    };
  }, [onScan]);

  return (
    <div id="qr-reader" className="w-full h-64 bg-gray-100 rounded" />
  );
}
