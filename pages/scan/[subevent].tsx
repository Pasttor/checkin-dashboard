// pages/scan/[subevent].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import dynamic                  from 'next/dynamic';

const ScanModal = dynamic(
  () => import('../../components/ScanModal').then((m) => m.ScanModal),
  { ssr: false }
);

export default function ScanPage() {
  const router = useRouter();
  const { subevent } = router.query;  // “charla-a” en este caso

  // Estado para abrir/cerrar el modal
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!subevent) return;
    // Abrimos el modal cuando el query subevent ya está disponible
    setIsScanning(true);
  }, [subevent]);

  const handleScan = async (code: string) => {
    const id = code.split('/').pop()!;
    console.log('→ Escaneo detectado, id=', id, 'subevent=', subevent);
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subevent }),
    });
    console.log('← Respuesta /api/checkin:', res.status, await res.json());
    router.push('/');
  };
  

  return (
    <>
      {isScanning && typeof subevent === 'string' && (
        <ScanModal
          // Pasamos el subevento convertido a un título legible
          eventName={subevent.replace('-', ' ').toUpperCase()}
          onClose={() => router.back()}
          onScan={handleScan}
        />
      )}
    </>
  );
}
