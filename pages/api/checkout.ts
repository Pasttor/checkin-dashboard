// pages/api/checkout.ts

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

  const { id } = req.body as { id: string };
  if (!id) {
    return res.status(400).json({ error: 'Falta ID' });
  }

  const { error } = await supabase
    .from('registrations')
    .update({ checked_in: false })
    .eq('id', id);

  if (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
