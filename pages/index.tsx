// pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ScanModal } from '../components/ScanModal';
import styles from '../styles/Home.module.css';

interface Attendee {
  id: string;
  name: string;
  checked_in: boolean;
}

export default function HomePage() {
  const router = useRouter();

  // Estados
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Carga de asistentes
  const fetchAttendees = async () => {
    try {
      const res = await fetch(`/api/attendees?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      setAttendees(json.attendees || []);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  // Manejo del escaneo
  const handleScan = async (code: string) => {
    const id = code.split('/').pop()!;
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setIsScanning(false);
      fetchAttendees();
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  console.log('isScanning:', isScanning);

  return (
    <>
      {/* DEBUG */}
      <div className={styles.debug}>isScanning: {String(isScanning)}</div>

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Nombre del Evento</h1>
          <button
            onClick={() => setIsScanning(true)}
            className={styles.scanButton}
            aria-label="Escanear QR"
          >
            {/* SVG icono de QR */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
            </svg>
          </button>
        </header>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Buscar asistentes..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && fetchAttendees()}
          />
          <div className={styles.iconWrapper}>
            {/* SVG lupa */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
            </svg>
          </div>
        </div>

        {/* Lista de asistentes */}
        <ul className={styles.list}>
          {attendees.length === 0 ? (
            <li style={{ textAlign: 'center', color: '#6B7280', padding: '0.75rem 1rem' }}>
              No hay asistentes registrados.
            </li>
          ) : (
            attendees.map(a => (
              <li key={a.id} className={styles.item}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`${styles.dot} ${a.checked_in ? styles.checked : styles.unchecked}`} />
                  <span className={styles.name}>{a.name}</span>
                </div>
                <button
                  onClick={() => router.push(`/attendees/${a.id}`)}
                  className={styles.arrowButton}
                  aria-label="Ver detalle"
                >
                  {/* SVG flecha → */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      </main>

      {/* Aquí montamos el modal real */}
      {isScanning && (
        <ScanModal onClose={() => setIsScanning(false)} onScan={handleScan} />
      )}
    </>
  );
}
