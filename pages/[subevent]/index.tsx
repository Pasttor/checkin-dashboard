// pages/[subevent]/index.tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import Link                     from 'next/link';
import dynamic                  from 'next/dynamic';
import styles                   from '../../styles/Home.module.css';
import type { GetServerSideProps } from 'next';

const ScanModal = dynamic(
  () => import('../../components/ScanModal').then((mod) => mod.ScanModal),
  { ssr: false }
);

interface Attendee {
  id: string;
  name: string;
  checked_in: boolean;
}

export default function SubEventListPage() {
  const router = useRouter();
  const { subevent } = router.query as { subevent: string };

  const [attendees, setAttendees]   = useState<Attendee[]>([]);
  const [search, setSearch]         = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    // si no hay subevent aún, esperar
    if (!subevent) return;
    fetchAttendees();
  }, [subevent]);

  async function fetchAttendees() {
    try {
      const res  = await fetch(
        `/api/attendees?search=${encodeURIComponent(search)}`
      );
      const json = await res.json();
      setAttendees(json.attendees || []);
    } catch (err) {
      console.error(err);
    }
  }

  // reset flag cada vez que abrimos el modal
  useEffect(() => {
    if (isScanning) setHasScanned(false);
  }, [isScanning]);

  const handleScan = async (code: string) => {
    if (hasScanned || !subevent) return;
    setHasScanned(true);

    const id = code.split('/').pop()!;
    try {
      await fetch('/api/checkin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, subevent }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
      router.push(`/${subevent}/attendees/${id}`);
    }
  };

  return (
    <>
      <main className={styles.container}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={() => router.push('/')}
            className={styles.backButton}
            aria-label="Volver a Main"
          >
            ←
          </button>
          <h1 className={styles.title}>
            {subevent?.replace(/-/g,' ').toUpperCase() || 'Cargando…'}
          </h1>
          <button
            onClick={() => setIsScanning(true)}
            className={styles.scanButton}
            aria-label="Escanear"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
            </svg>
          </button>
        </header>

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
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
            </svg>
          </div>
        </div>

        <ul className={styles.list}>
          {attendees.length === 0 ? (
            <li className={styles.noAttendees}>
              No hay asistentes registrados.
            </li>
          ) : (
            attendees.map(a => (
              <li key={a.id} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={`${styles.dot} ${a.checked_in?styles.checked:styles.unchecked}`}/>
                  <span className={styles.name}>{a.name}</span>
                </div>
                <button
                  onClick={() => router.push(`/${subevent}/attendees/${a.id}`)}
                  className={styles.arrowButton}
                  aria-label="Ver detalle"
                >
                  →
                </button>
              </li>
            ))
          )}
        </ul>
      </main>

      {isScanning && (
        <ScanModal
          eventName={subevent.replace(/-/g,' ').toUpperCase()}
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}
    </>
  );
}

// Este getServerSideProps desactiva SSG y evita el error de replace(undefined)
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
