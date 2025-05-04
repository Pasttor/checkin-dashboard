// pages/[subevent]/attendees/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter }            from 'next/router';
import styles from '../../../styles/Detail.module.css';



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

export default function SubEventAttendeeDetail() {
  const router = useRouter();
  const { subevent, id } = router.query as { subevent: string; id: string };

  const [attendee, setAttendee] = useState<Attendee|null>(null);
  const [checkins, setCheckins] = useState<CheckinsGrouped|null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string|null>(null);

  const [btnLoading, setBtnLoading]   = useState(false);
  const [checkedIn, setCheckedIn]     = useState(false);

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
      } catch (e:any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toggleCheck = async () => {
    if (!attendee) return;
    setBtnLoading(true);
    try {
      const endpoint = checkedIn ? '/api/checkout' : '/api/checkin';
      const body = checkedIn
        ? { id: attendee.id }
        : { id: attendee.id, subevent };
      const res = await fetch(endpoint, {
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body:JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setCheckedIn(!checkedIn);
    } catch (e) {
      console.error(e);
      alert('Error cambiando estado');
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
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
          aria-label="Volver"
        >←</button>
        <h1 className={styles.eventTitle}>{labels[subevent]}</h1>
        <button
          onClick={() => setBtnLoading(false) /* opcional: re-escanea */}
          className={styles.scanButton}
        >✕</button>
      </header>

      <section className={styles.profileSection}>
        <h2 className={styles.name}>{attendee.name}</h2>
        <span className={checkedIn?styles.badgeChecked:styles.badgeNotChecked}>
          {checkedIn?'Checked-in':'Not Checked-in'}
        </span>
      </section>

      <section className={styles.infoSection}>
        {/* igual que antes */}
        <p><strong>Ticket Title</strong><br/>Nombre del evento</p>
        <p><strong>Order Date</strong><br/>{new Date(attendee.created_at).toLocaleDateString()}</p>
        <p><strong>Rol</strong><br/>{attendee.role}</p>
        <p><strong>Email</strong><br/>{attendee.email}</p>
        <p><strong>Teléfono</strong><br/>{attendee.phone}</p>
      </section>

      <hr className={styles.divider}/>

      <section className={styles.checksSection}>
        <h3 className={styles.sectionTitle}>Historial de Entradas</h3>
        {(Object.keys(checkins) as (keyof CheckinsGrouped)[]).map(sub => {
          const times = checkins[sub];
          return (
            <div key={sub} className={styles.checkBlock}>
              <span className={styles.checkTitle}>
                {labels[sub]}: {times.length}
              </span>
              <ul className={styles.checkList}>
                {times.length>0
                  ? times.map(ts=> <li key={ts}>{new Date(ts).toLocaleString()}</li>)
                  : <li className={styles.noHistory}>Sin registros</li>
                }
              </ul>
            </div>
          );
        })}
      </section>

      <button
        onClick={toggleCheck}
        disabled={btnLoading}
        className={checkedIn?styles.checkoutButton:styles.checkinButton}
      >
        {btnLoading? 'Procesando…' : (checkedIn? 'Check-Out' : 'Check-In')}
      </button>
    </div>
  );
}
