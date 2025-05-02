// pages/api/attendees/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { search } = req.query;
    let query = supabase
      .from('registrations')
      .select('id, name, checked_in')
      .order('name', { ascending: true });

    if (typeof search === 'string' && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ attendees: data });
  } catch (err: any) {
    console.error('GET /api/attendees error:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
