// pages/attendees/[id].tsx

import { GetServerSideProps } from 'next';
import { useRouter }            from 'next/router';
import dynamic                   from 'next/dynamic';
import { useState }              from 'react';
import { supabase }              from '../../lib/supabase';
import styles                    from '../../styles/Home.module.css';

// Cargamos dinámicamente el ScanModal sin SSR
const ScanModal = dynamic(
  () => import('../../components/ScanModal').then((mod) => mod.ScanModal),
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

interface Props {
  attendee: Attendee;
}

export default function AttendeeDetail({ attendee }: Props) {
  const router = useRouter();
  const [checkedIn, setCheckedIn]   = useState(attendee.checked_in);
  const [loading, setLoading]       = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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
      console.error(e);
      alert('Error al hacer check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.detailContainer}>
        {/* Header con back + scan */}
        <div className={styles.detailHeader}>
  <button className={styles.backButton} onClick={() => router.back()}>
    ←
  </button>
  <h3 className={styles.detailTitle}>Nombre del Evento</h3>
  <button
    className={styles.scanButton}
    onClick={() => setIsScanning(true)}
  >
    {/* ícono */}
  </button>
</div>

        {/* Nombre + badge debajo */}
        <div className={styles.nameSection}>
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
            <p>
              {new Date(attendee.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </p>
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

        {/* Botón de Check-In */}
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={checkedIn || loading}
          className={styles.checkinButton}
        >
          {loading
            ? 'Procesando…'
            : checkedIn
            ? 'Ya Check-in'
            : 'Check-In'}
        </button>
      </div>

      {/* Modal de escaneo */}
      {isScanning && (
        <ScanModal
          eventName="Nombre del Evento"
          onClose={() => setIsScanning(false)}
          onScan={async (code: string) => {
            // tras escanear, hacemos check-in
            await fetch('/api/checkin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: attendee.id }),
            });
            setCheckedIn(true);
            setIsScanning(false);
          }}
        />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
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
    props: { attendee: data },
  };
};
