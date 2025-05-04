// pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import dynamic                  from 'next/dynamic';
import Link                     from 'next/link';
import styles                   from '../styles/Home.module.css';

// ScanModal cargado sin SSR
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

  // Lista de asistentes + búsqueda
  const [attendees, setAttendees]     = useState<Attendee[]>([]);
  const [search, setSearch]           = useState<string>('');
  // Estados para el escáner principal
  const [isScanning, setIsScanning]       = useState<boolean>(false);
  const [hasScannedMain, setHasScannedMain] = useState<boolean>(false);

  // Función para obtener asistentes
  const fetchAttendees = async () => {
    try {
      const res  = await fetch(
        `/api/attendees?search=${encodeURIComponent(search)}`
      );
      const json = await res.json();
      setAttendees(json.attendees || []);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    }
  };

  // Llamamos a fetchAttendees una vez al montar
  useEffect(() => {
    fetchAttendees();
  }, []);

  // Reset del flag cuando abrimos el modal
  useEffect(() => {
    if (isScanning) {
      setHasScannedMain(false);
    }
  }, [isScanning]);

  const handleScan = async (code: string) => {
    if (hasScannedMain) return;
    setHasScannedMain(true);

    const id = code.split('/').pop()!;
    try {
      const res = await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, subevent: 'main' }),
      });
      if (!res.ok) {
        console.error('Check-in fallido:', await res.text());
      }
    } catch (err) {
      console.error('Error durante check-in:', err);
    } finally {
      setIsScanning(false);
      router.push(`/attendees/${id}`);
    }
  };

  return (
    <>
      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          {/* Dropdown para seleccionar subevento */}
          <select
            className={styles.dropdown}
            value="main"
            onChange={e => {
              const v = e.target.value;
              router.push(v === 'main' ? '/' : `/${v}`);
            }}
          >
            <option value="main">Main Check</option>
            <option value="charla-a">Charla A</option>
            <option value="taller-b">Taller B</option>
            <option value="networking">Networking</option>
            <option value="demo-x">Demo X</option>
          </select>

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

        {/* Enlaces de prueba a subeventos */}
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Link href="/scan/charla-a" className="underline text-blue-600">
            Escanear Charla A
          </Link>{' '}
          |{' '}
          <Link href="/scan/taller-b" className="underline text-blue-600">
            Taller B
          </Link>{' '}
          |{' '}
          <Link href="/scan/networking" className="underline text-blue-600">
            Networking
          </Link>{' '}
          |{' '}
          <Link href="/scan/demo-x" className="underline text-blue-600">
            Demo X
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
              if (e.key === 'Enter') {
                fetchAttendees();
              }
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

      {/* Modal de escaneo principal */}
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
