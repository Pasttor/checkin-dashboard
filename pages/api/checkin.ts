// pages/api/checkin.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient }                        from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id, subevent } = req.body as {
    id: string;
    subevent: string;
  };
  console.log('⚡️ /api/checkin body:', { id, subevent });

  if (!id || !subevent) {
    return res.status(400).json({ error: 'Falta id o subevento' });
  }

  // 1) Si es el check-in principal, marcamos el booleano
  if (subevent === 'main') {
    const { error: updErr } = await supabase
      .from('registrations')
      .update({ checked_in: true })
      .eq('id', id);

    if (updErr) {
      console.error('Error marcando main check-in:', updErr);
      return res.status(500).json({ error: updErr.message });
    }
  }

  // 2) Insert en la tabla de logs
  const { data: insData, error: insErr } = await supabase
    .from('checkins')
    .insert({ registration_id: id, subevent })
    .select();

  if (insErr) {
    console.error('Error insertando en checkins:', insErr);
    return res.status(500).json({ error: insErr.message });
  }

  console.log('✅ Checkin registrado:', insData);
  return res.status(200).json({ success: true });
}
