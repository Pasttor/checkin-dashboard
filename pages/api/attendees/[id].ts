// pages/api/attendees/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient }                          from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

type HandlerResponse =
  | { attendee: Attendee }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HandlerResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Hacemos la consulta sin genéricos en .select,
  // y luego llamamos a .single<Attendee>() para tipar el resultado.
  const result = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single<Attendee>();

  if (result.error) {
    console.error('API error fetching attendee:', result.error);
    return res.status(500).json({ error: result.error.message });
  }
  if (!result.data) {
    return res.status(404).json({ error: 'Asistente no encontrado' });
  }

  // Aquí TS sabe que result.data es un Attendee
  const attendee = result.data;

  return res.status(200).json({ attendee });
}
