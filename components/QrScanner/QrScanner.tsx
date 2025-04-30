// components/QrScanner.tsx
import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const regionId = 'qr-reader';
    const html5QrCode = new Html5Qrcode(regionId);

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        decodedText => {
          onScan(decodedText);
          html5QrCode.stop();
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
    };
  }, [onScan]);

  // AQUÍ: ocupa todo el espacio que le des, flex-1 en el padre
  return <div id="qr-reader" className="w-full h-full" />;
}
