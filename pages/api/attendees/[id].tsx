// pages/attendees/[id].tsx

import { useRouter } from 'next/router';
import useSWR from 'swr';
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

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AttendeeDetail() {
  const { query, isReady } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  const { data, error } = useSWR<{ attendee: Attendee }>(
    isReady && id ? `/api/attendees/${id}` : null,
    fetcher
  );

  if (error) return <p className={styles.error}>Error cargando datos</p>;
  if (!data)  return <p className={styles.loading}>Cargando…</p>;

  const a = data.attendee;

  return (
    <div className={styles.detailContainer}>
      <button onClick={() => history.back()} className={styles.backButton}>
        ← Volver
      </button>
      <h1 className={styles.detailTitle}>{a.name}</h1>
      <p><strong>Email:</strong> {a.email}</p>
      <p><strong>Teléfono:</strong> {a.phone}</p>
      <p><strong>Rol:</strong> {a.role}</p>
      <p><strong>Registrado:</strong> {new Date(a.created_at).toLocaleString()}</p>
      <img src={a.qr_code_url} alt="Código QR" className={styles.qrImage} />
      <p><strong>Check-in:</strong> {a.checked_in ? 'Sí' : 'No'}</p>
    </div>
  );
}
