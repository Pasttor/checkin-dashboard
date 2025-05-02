// pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import Link                     from 'next/link';
import dynamic                  from 'next/dynamic';
import styles                   from '../styles/Home.module.css';

// Carga ScanModal sin SSR para evitar errores en Vercel
const ScanModal = dynamic(
  () => import('../components/ScanModal').then((mod) => mod.ScanModal),
  { ssr: false }
);

interface Attendee {
  id: string;
  name: string;
  checked_in: boolean;
}

export default function HomePage() {
  const router = useRouter();

  // Estados
  const [attendees, setAttendees]   = useState<Attendee[]>([]);
  const [search, setSearch]         = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Obtener lista de asistentes
  const fetchAttendees = async () => {
    try {
      const res  = await fetch(`/api/attendees?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      setAttendees(json.attendees || []);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  // Al leer un QR, marcar check-in
  const handleScan = async (code: string) => {
    const id = code.split('/').pop()!;
    try {
      await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, subevent: 'main' }),
      });
    } catch (err) {
      console.error('Error during check-in:', err);
    } finally {
      setIsScanning(false);
      fetchAttendees();
    }
  };

  return (
    <>
      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Nombre del Evento</h1>
          <button
            type="button"
            onClick={() => setIsScanning(true)}
            className={styles.scanButton}
            aria-label="Escanear QR"
          >
            {/* Icono QR */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3"
              />
            </svg>
          </button>
        </header>

        {/* Enlace de prueba para Charla A */}
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Link href="/scan/charla-a">
            <a style={{ color: '#3b82f6', textDecoration: 'underline' }}>
              Escanear Charla A (prueba)
            </a>
          </Link>
        </div>

        {/* Búsqueda */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Buscar asistentes..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') fetchAttendees();
            }}
          />
          <div className={styles.iconWrapper}>
            {/* Icono lupa */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        </div>

        {/* Lista de asistentes */}
        <ul className={styles.list}>
          {attendees.length === 0 ? (
            <li className={styles.noAttendees}>
              No hay asistentes registrados.
            </li>
          ) : (
            attendees.map((a) => (
              <li key={a.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span
                    className={`${styles.dot} ${
                      a.checked_in ? styles.checked : styles.unchecked
                    }`}
                  />
                  <span className={styles.name}>{a.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/attendees/${a.id}`)}
                  className={styles.arrowButton}
                  aria-label="Ver detalle"
                >
                  {/* Icono flecha → */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      </main>

      {/* Modal de escaneo */}
      {isScanning && (
        <ScanModal
          eventName="Nombre del Evento"
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}
    </>
  );
}
