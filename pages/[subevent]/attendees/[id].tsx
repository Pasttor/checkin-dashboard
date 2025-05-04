// pages/[subevent]/attendees/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import dynamic                  from 'next/dynamic';
import styles                   from '../../../styles/Detail.module.css';
import type { GetServerSideProps } from 'next';

// Cargamos ScanModal sin SSR
const ScanModal = dynamic(
  () => import('../../../components/ScanModal').then((m) => m.ScanModal),
  { ssr: false }
);

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  checked_in: boolean;
  created_at: string;
}

type CheckinsGrouped = Record<
  'main'|'charla-a'|'taller-b'|'networking'|'demo-x',
  string[]
>;

export default function SubEventAttendeeDetail() {
  const router = useRouter();
  const { subevent, id } = router.query as {
    subevent: string;
    id: string;
  };

  // Datos del asistente
  const [attendee, setAttendee] = useState<Attendee|null>(null);
  const [checkins, setCheckins] = useState<CheckinsGrouped|null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string|null>(null);

  // Estado toggle y escáner
  const [checkedIn, setCheckedIn]   = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Labels legibles
  const labels: Record<string,string> = {
    main:        'Main Check',
    'charla-a':  'Charla A',
    'taller-b':  'Taller B',
    networking:  'Networking',
    'demo-x':    'Demo X',
  };

  // Carga datos al montar
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/attendees/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(await res.text());
        const json: { attendee: Attendee; checkins: CheckinsGrouped } =
          await res.json();
        setAttendee(json.attendee);
        setCheckins(json.checkins);
        setCheckedIn(json.attendee.checked_in);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Reset flag al abrir modal
  useEffect(() => {
    if (isScanning) setHasScanned(false);
  }, [isScanning]);

  // Toggle check-in / check-out
  const toggleCheck = async () => {
    if (!attendee) return;
    setBtnLoading(true);
    try {
      const endpoint = checkedIn ? '/api/checkout' : '/api/checkin';
      const body = checkedIn
        ? { id: attendee.id }
        : { id: attendee.id, subevent };
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setCheckedIn(!checkedIn);
    } catch {
      alert('Error cambiando estado');
    } finally {
      setBtnLoading(false);
    }
  };

  // Handler de escaneo
  const handleScan = async (code: string) => {
    if (hasScanned) return;
    setHasScanned(true);
    const scannedId = code.split('/').pop()!;
    if (scannedId === id) {
      await toggleCheck();
    } else {
      router.push(`/${subevent}/attendees/${scannedId}`);
    }
    setIsScanning(false);
  };

  if (loading) return <p className={styles.loading}>Cargando…</p>;
  if (error)   return <p className={styles.error}>Error: {error}</p>;
  if (!attendee || !checkins) return <p className={styles.error}>No encontrado.</p>;

  return (
    <div className={styles.container}>
      {/* HEADER: back + dropdown + scan */}
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
          aria-label="Volver"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <select
          className={styles.dropdown}
          value={subevent}
          onChange={(e) => {
            const v = e.target.value;
            // ir al listado de ese subevento
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
          onClick={() => setIsScanning(true)}
          className={styles.scanButton}
          aria-label="Escanear"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
          </svg>
        </button>
      </header>

      {/* PERFIL */}
      <section className={styles.profileSection}>
        <h2 className={styles.name}>{attendee.name}</h2>
        <span className={checkedIn ? styles.badgeChecked : styles.badgeNotChecked}>
          {checkedIn ? 'Checked-in' : 'Not Checked-in'}
        </span>
      </section>

      {/* INFO BÁSICA */}
      <section className={styles.infoSection}>
        <p><strong>Ticket Title</strong><br/>Nombre del evento</p>
        <p><strong>Order Date</strong><br/>{new Date(attendee.created_at).toLocaleDateString()}</p>
        <p><strong>Rol</strong><br/>{attendee.role}</p>
        <p><strong>Email</strong><br/>{attendee.email}</p>
        <p><strong>Teléfono</strong><br/>{attendee.phone}</p>
      </section>

      <hr className={styles.divider} />

      {/* HISTORIAL */}
      <section className={styles.checksSection}>
        <h3 className={styles.sectionTitle}>Historial de Entradas</h3>
        {(Object.keys(checkins) as (keyof CheckinsGrouped)[]).map((sub) => {
          const times = checkins[sub];
          return (
            <div key={sub} className={styles.checkBlock}>
              <span className={styles.checkTitle}>
                {labels[sub]}: {times.length}
              </span>
              <ul className={styles.checkList}>
                {times.length > 0
                  ? times.map((ts) => <li key={ts}>{new Date(ts).toLocaleString()}</li>)
                  : <li className={styles.noHistory}>Sin registros</li>
                }
              </ul>
            </div>
          );
        })}
      </section>

      {/* BOTÓN TOGGLE */}
      <button
        onClick={toggleCheck}
        disabled={btnLoading}
        className={checkedIn ? styles.checkoutButton : styles.checkinButton}
      >
        {btnLoading
          ? 'Procesando…'
          : checkedIn ? 'Check-Out' : 'Check-In'}
      </button>

      {/* MODAL DE ESCANEO */}
      {isScanning && (
        <ScanModal
          eventName={labels[subevent]}
          onClose={() => setIsScanning(false)}
          onScan={handleScan}
        />
      )}
    </div>
  );
}

// Desactivamos SSG
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
