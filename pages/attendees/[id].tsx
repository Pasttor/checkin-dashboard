// pages/attendees/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import styles                   from '../../styles/Home.module.css';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  checked_in: boolean;
  created_at: string;
  qr_code_url: string;
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

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/attendees/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(await res.text());
        const json: {
          attendee: Attendee;
          checkins: CheckinsGrouped;
        } = await res.json();
        setAttendee(json.attendee);
        setCheckins(json.checkins);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className={styles.loading}>Cargando…</p>;
  if (error)   return <p className={styles.error}>Error: {error}</p>;
  if (!attendee || !checkins) return <p className={styles.error}>No encontrado.</p>;

  // Helpers para mostrar nombres legibles
  const labels: Record<string,string> = {
    main:        'Entrada Principal',
    'charla-a':  'Charla A',
    'taller-b':  'Taller B',
    networking:  'Networking',
    'demo-x':    'Demo X',
  };

  return (
    <div className={styles.detailContainer}>
      {/* Botón volver */}
      <button
        type="button"
        onClick={() => router.back()}
        className={styles.backButton}
      >
        ← Volver
      </button>

      {/* Datos principales */}
      <h1 className={styles.detailTitle}>{attendee.name}</h1>
      <p>
        <strong>Email:</strong> {attendee.email}<br/>
        <strong>Teléfono:</strong> {attendee.phone}<br/>
        <strong>Rol:</strong> {attendee.role}<br/>
        <strong>Registrado:</strong>{' '}
        {new Date(attendee.created_at).toLocaleString()}
      </p>
      <p>
        <strong>Status Check-in:</strong>{' '}
        <span
          className={attendee.checked_in
            ? styles.statusBadgeChecked
            : styles.statusBadgeNotChecked}
        >
          {attendee.checked_in ? 'Checked-in' : 'Not Checked-in'}
        </span>
      </p>

      {/* Sección de contadores e historial */}
      <section className={styles.checksSection}>
        <h2 className={styles.subheader}>Historial de Entradas</h2>

        { (Object.keys(checkins) as (keyof CheckinsGrouped)[]).map((sub) => {
          const times = checkins[sub];
          return (
            <div key={sub} className={styles.checkBlock}>
              <h3 className={styles.checkTitle}>
                {labels[sub]} ({times.length})
              </h3>
              <ul className={styles.checkList}>
                {times.map((ts) => (
                  <li key={ts}>
                    {new Date(ts).toLocaleString()}
                  </li>
                ))}
                {times.length === 0 && (
                  <li className={styles.noHistory}>Sin registros</li>
                )}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
