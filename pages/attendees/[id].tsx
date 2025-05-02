// pages/attendees/[id].tsx

import { GetServerSideProps } from 'next';
import { useRouter }         from 'next/router';
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
  qr_code_url: string;
}

interface Props {
  attendee: Attendee;
}

export default function AttendeeDetail({ attendee }: Props) {
  const router = useRouter();

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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { id } = ctx.params!;

  // Hacemos la consulta sin genéricos en .from()
  // y tipamos con .single<Attendee>() al final
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
