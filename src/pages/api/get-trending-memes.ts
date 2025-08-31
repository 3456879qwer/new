import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('API Route /get-trending-memes: Missing Supabase URL or Anon Key environment variables');
    return res.status(500).json({ message: 'Server configuration error: Supabase keys missing.' });
  }


  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log(`API Route /get-trending-memes: Fetching trending videos for date: ${todayDate}`);

    const { data, error: fetchError } = await supabase
      .from('trending_videos')
      .select('*')
      .eq('display_date', todayDate)
      .order('rank', { ascending: true });

    if (fetchError) {
      console.error('API Route /get-trending-memes: Error fetching trending videos from Supabase:', fetchError);
      return res.status(500).json({
        message: `Failed to fetch trending videos from Supabase: ${fetchError.message}`,
        details: fetchError,
      });
    }

    res.status(200).json(data); 
  } catch (error: any) {
    console.error('API Route /get-trending-memes: Unexpected error:', error.message);
    res.status(500).json({ message: `An unexpected server error occurred: ${error.message}` });
  }
}