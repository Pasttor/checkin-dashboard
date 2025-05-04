// pages/attendees/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import styles                   from '../../styles/Detail.module.css';

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
  'main' | 'charla-a' | 'taller-b' | 'networking' | 'demo-x',
  string[]
>;

export default function AttendeeDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [attendee, setAttendee]       = useState<Attendee | null>(null);
  const [checkins, setCheckins]       = useState<CheckinsGrouped | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Estado para badge y botón
  const [checkedIn, setCheckedIn]     = useState<boolean>(false);
  const [btnLoading, setBtnLoading]   = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/attendees/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(await res.text());
        const json: { attendee: Attendee; checkins: CheckinsGrouped } = await res.json();
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

  // Handler de toggle check-in / check-out
  const toggleCheck = async () => {
    if (!attendee) return;
    setBtnLoading(true);
    try {
      const endpoint = checkedIn ? '/api/checkout' : '/api/checkin';
      const body = checkedIn
        ? { id: attendee.id }
        : { id: attendee.id, subevent: 'main' };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setCheckedIn(!checkedIn);
    } catch (e) {
      console.error(e);
      alert('Error al cambiar estado');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando…</p>;
  if (error)   return <p className={styles.error}>Error: {error}</p>;
  if (!attendee || !checkins) return <p className={styles.error}>No encontrado.</p>;

  const labels: Record<string,string> = {
    main:        'Entrada Principal',
    'charla-a':  'Charla A',
    'taller-b':  'Taller B',
    networking:  'Networking',
    'demo-x':    'Demo X',
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
          aria-label="Volver"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h1 className={styles.eventTitle}>Main Check</h1>

        <button
          type="button"
          onClick={() => router.push(`/scan/main?returnTo=/attendees/${id}`)}
          className={styles.scanButton}
          aria-label="Escanear QR"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
          </svg>
        </button>
      </header>

      {/* PERFIL */}
      <section className={styles.profileSection}>
        <h2 className={styles.name}>{attendee.name}</h2>
        <span
          className={
            checkedIn ? styles.badgeChecked : styles.badgeNotChecked
          }
        >
          {checkedIn ? 'Checked-in' : 'Not Checked-in'}
        </span>
      </section>

      {/* INFORMACIÓN BÁSICA */}
      <section className={styles.infoSection}>
        <p>
          <strong>Ticket Title</strong><br/>
          Nombre del evento
        </p>
        <p>
          <strong>Order Date</strong><br/>
          {new Date(attendee.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })}
        </p>
        <p>
          <strong>Rol</strong><br/>
          {attendee.role}
        </p>
        <p>
          <strong>Email</strong><br/>
          {attendee.email}
        </p>
        <p>
          <strong>Número de teléfono</strong><br/>
          {attendee.phone}
        </p>
      </section>

      {/* DIVISOR */}
      <hr className={styles.divider} />

      {/* HISTORIAL Y CONTADORES */}
      <section className={styles.checksSection}>
        <h3 className={styles.sectionTitle}>Historial de Entradas</h3>

        {(Object.keys(checkins) as (keyof CheckinsGrouped)[]).map((sub) => {
          const times = checkins[sub];
          return (
            <div key={sub} className={styles.checkBlock}>
              <div className={styles.checkHeader}>
                <span className={styles.checkTitle}>
                  {labels[sub]}: {times.length}
                </span>
              </div>
              <ul className={styles.checkList}>
                {times.length > 0 ? (
                  times.map((ts) => (
                    <li key={ts}>
                      {new Date(ts).toLocaleString()}
                    </li>
                  ))
                ) : (
                  <li className={styles.noHistory}>Sin registros</li>
                )}
              </ul>
            </div>
          );
        })}
      </section>

      {/* BOTÓN DE CHECK-IN / CHECK-OUT */}
      <button
        type="button"
        onClick={toggleCheck}
        disabled={btnLoading}
        className={
          checkedIn ? styles.checkoutButton : styles.checkinButton
        }
      >
        {btnLoading
          ? 'Procesando…'
          : checkedIn
          ? 'Check-Out'
          : 'Check-In'}
      </button>
    </div>
  );
}
