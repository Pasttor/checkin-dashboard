// pages/api/checkin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.body as { id?: string };
  if (!id) {
    return res.status(400).json({ error: 'Falta el ID del asistente' });
  }

  try {
    const { error } = await supabase
      .from('registrations')
      .update({ checked_in: true })
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('POST /api/checkin error:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
