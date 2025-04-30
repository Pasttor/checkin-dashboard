// pages/api/attendees/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      // no encontrado
      return res.status(404).json({ error: 'Asistente no encontrado' });
    }
    if (error) throw error;

    return res.status(200).json({ attendee: data });
  } catch (err: any) {
    console.error('GET /api/attendees/[id] error:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
