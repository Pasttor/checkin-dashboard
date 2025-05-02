// pages/api/checkin.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, subevent } = req.body as { id: string; subevent: string };

  if (!id || !subevent) {
    return res.status(400).json({ error: 'Falta id o subevento' });
  }

  try {
    // 1) Si es el check-in principal ("main"), marcamos el booleano
    if (subevent === 'main') {
      await supabase
        .from('registrations')
        .update({ checked_in: true })
        .eq('id', id);
    }

    // 2) Insertamos en el log de checkins
    await supabase
      .from('checkins')
      .insert({ registration_id: id, subevent });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Checkin API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

