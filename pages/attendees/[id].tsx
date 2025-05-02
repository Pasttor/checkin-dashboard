// pages/attendees/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';

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

export default function AttendeeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const attendeeId = Array.isArray(id) ? id[0] : id;

  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!attendeeId) return;
    const idStr = attendeeId; // ahora idStr es definitivamente string

    async function fetchAttendee() {
      try {
        const res = await fetch(
          `/api/attendees/${encodeURIComponent(idStr)}`
        );
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const json = (await res.json()) as { attendee: Attendee };
        setAttendee(json.attendee);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendee();
  }, [attendeeId]);

  if (loading) {
    return <p className={styles.loading}>Cargando…</p>;
  }
  if (error) {
    return <p className={styles.error}>Error: {error}</p>;
  }
  if (!attendee) {
    return <p className={styles.error}>Asistente no encontrado.</p>;
  }

  return (
    <div className={styles.detailContainer}>
      <button
        type="button"
        onClick={() => router.back()}
        className={styles.backButton}
      >
        ← Volver
      </button>

      <h1 className={styles.detailTitle}>{attendee.name}</h1>

      <ul className={styles.detailList}>
        <li>
          <strong>Email:</strong> {attendee.email}
        </li>
        <li>
          <strong>Teléfono:</strong> {attendee.phone}
        </li>
        <li>
          <strong>Rol:</strong> {attendee.role}
        </li>
        <li>
          <strong>Registrado:</strong>{' '}
          {new Date(attendee.created_at).toLocaleString()}
        </li>
        <li>
          <strong>Check-in:</strong>{' '}
          {attendee.checked_in ? 'Sí' : 'No'}
        </li>
      </ul>

      <div className={styles.qrContainer}>
        <img
          src={attendee.qr_code_url}
          alt="Código QR"
          className={styles.qrImage}
        />
      </div>
    </div>
  );
}
