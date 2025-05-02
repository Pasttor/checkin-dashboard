// pages/scan/[subevent].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import dynamic                  from 'next/dynamic';

const ScanModal = dynamic(
  () => import('../../components/ScanModal').then((mod) => mod.ScanModal),
  { ssr: false }
);

export default function ScanPage() {
  const router = useRouter();
  const { subevent } = router.query;  // "charla-a", etc.

  // Estado para mostrar/ocultar el modal
  const [isScanning, setIsScanning] = useState(false);
  // Flag para evitar múltiples escaneos en un solo load
  const [hasScanned, setHasScanned] = useState(false);

  // Abrir el modal cuando tengamos el subevento
  useEffect(() => {
    if (typeof subevent === 'string') {
      setIsScanning(true);
    }
  }, [subevent]);

  const handleScan = async (code: string) => {
    // Solo manejamos el primer escaneo
    if (hasScanned) return;
    setHasScanned(true);

    const id = code.split('/').pop()!;
    try {
      const res = await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, subevent }),
      });
      if (!res.ok) {
        console.error('Check-in fallido:', await res.text());
      }
    } catch (err) {
      console.error('Error durante check-in:', err);
    } finally {
      // Cerramos el modal y navegamos a la info del asistente
      setIsScanning(false);
      router.push(`/attendees/${id}`);
    }
  };

  return (
    <>
      {isScanning && typeof subevent === 'string' && (
        <ScanModal
          eventName={subevent.replace('-', ' ').toUpperCase()}
          onClose={() => router.back()}
          onScan={handleScan}
        />
      )}
    </>
  );
}
