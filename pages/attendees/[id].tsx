// pages/attendees/[id].tsx

import { GetServerSideProps } from 'next';
import { useRouter }         from 'next/router';
import { useState }          from 'react';
import { supabase }          from '../../lib/supabase';
import styles                from '../../styles/Home.module.css';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  checked_in: boolean;
  created_at: string;
}

interface Props {
  attendee: Attendee;
}

export default function AttendeeDetail({ attendee }: Props) {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(attendee.checked_in);
  const [loading, setLoading]     = useState(false);

  const handleScan = () => {
    // simplemente abrimos el modal de escaneo en la misma página
    // podrías reutilizar tu ScanModal aquí
    router.push('/'); // o la lógica que abra tu modal
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: attendee.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setCheckedIn(true);
    } catch (e) {
      console.error('Check-in error:', e);
      alert('No se pudo hacer check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.detailContainer}>
      {/* Header con back + scan */}
      <div className={styles.detailHeader}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          ←
        </button>
        <h1 className={styles.detailTitle}>Attendee Details</h1>
        <button
          type="button"
          onClick={handleScan}
          className={styles.scanButton}
          aria-label="Escanear QR"
        >
          {/* icono de escaneo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
          </svg>
        </button>
      </div>

      {/* Nombre + estado */}
      <div className={styles.detailNameRow}>
        <h2 className={styles.attendeeName}>{attendee.name}</h2>
        <span
          className={
            checkedIn
              ? styles.statusBadgeChecked
              : styles.statusBadgeNotChecked
          }
        >
          {checkedIn ? 'Checked-in' : 'Not Checked-in'}
        </span>
      </div>

      {/* Detalles */}
      <ul className={styles.detailList}>
        <li>
          <strong>Ticket Title</strong>
          <p>Nombre del evento</p>
        </li>
        <li>
          <strong>Order Date</strong>
          <p>{new Date(attendee.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })}</p>
        </li>
        <li>
          <strong>Rol</strong>
          <p>{attendee.role}</p>
        </li>
        <li>
          <strong>Email</strong>
          <p>{attendee.email}</p>
        </li>
        <li>
          <strong>Número de teléfono</strong>
          <p>{attendee.phone}</p>
        </li>
      </ul>

      {/* Botón Check-In */}
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={checkedIn || loading}
        className={styles.checkinButton}
      >
        {loading
          ? 'Procesando…'
          : checkedIn
          ? 'Ya está Check-in'
          : 'Check-In'}
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const { id } = ctx.params!;
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id as string)
    .single<Attendee>();

  if (error || !data) {
    return { notFound: true };
  }

  return {
    props: {
      attendee: data,
    },
  };
};
