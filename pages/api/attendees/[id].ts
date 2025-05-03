// pages/api/attendees/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase }                            from '../../../lib/supabase';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { attendee: Attendee; checkins: CheckinsGrouped } | { error: string }
  >
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // 1) Traer el registro del asistente
  const { data: attendee, error: attErr } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single<Attendee>();

  if (attErr || !attendee) {
    return res.status(404).json({ error: 'Asistente no encontrado' });
  }

  // 2) Traer todos los logs de checkin
  const { data: rawCheckins, error: chkErr } = await supabase
    .from('checkins')
    .select('subevent, created_at')
    .eq('registration_id', id)
    .order('created_at', { ascending: false });

  if (chkErr) {
    console.error('Error fetching checkins:', chkErr);
    return res.status(500).json({ error: chkErr.message });
  }

  // 3) Agrupar por subevent
  const grouped: CheckinsGrouped = {
    main: [],
    'charla-a': [],
    'taller-b': [],
    networking: [],
    'demo-x': [],
  };

  rawCheckins?.forEach((c) => {
    const s = c.subevent as keyof typeof grouped;
    grouped[s].push(c.created_at);
  });

  return res.status(200).json({ attendee, checkins: grouped });
}
