import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Verify the CRON_SECRET to ensure only Vercel can trigger this endpoint
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials missing in environment' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Perform a lightweight query to trigger a heartbeat on the products table
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Heartbeat query failed' });
    }

    return res.status(200).json({ success: true, message: 'Heartbeat successful', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Unexpected error during heartbeat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
