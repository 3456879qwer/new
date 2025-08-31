import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const techRatesEndpoint = `${supabaseUrl}/rest/v1/tech_rates?select=*`;

  console.log('TEST_DIRECT_FETCH: Starting direct fetch test...');
  console.log('TEST_DIRECT_FETCH: Target URL:', techRatesEndpoint);
  console.log('TEST_DIRECT_FETCH: Using Anon Key:', supabaseAnonKey ? 'Loaded' : 'NOT LOADED');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('TEST_DIRECT_FETCH: Missing environment variables for Supabase.');
    return res.status(500).json({ message: 'Supabase environment variables not configured.' });
  }

  try {
    const response = await fetch(techRatesEndpoint, {
      method: 'GET', 
      headers: {
        'apikey': supabaseAnonKey, 
        'Authorization': `Bearer ${supabaseAnonKey}`, 
        'Content-Type': 'application/json',
      },
    });

    console.log('TEST_DIRECT_FETCH: Response received. Status:', response.status, response.statusText);
    const responseBody = await response.text(); 
    console.log('TEST_DIRECT_FETCH: Raw Response Body:', responseBody);

    if (!response.ok) {
      console.error('TEST_DIRECT_FETCH: Non-OK response from Supabase API.');
      return res.status(response.status).json({
        message: `Supabase API returned non-OK status: ${response.statusText}`,
        details: responseBody,
      });
    }

    const data = JSON.parse(responseBody);
    console.log('TEST_DIRECT_FETCH: Parsed JSON Data:', data);

    res.status(200).json({
      message: 'Direct fetch test successful!',
      data: data,
    });

  } catch (error: any) {
    console.error('TEST_DIRECT_FETCH: Error during direct fetch:', error);
    res.status(500).json({
      message: 'Failed during direct fetch test.',
      error: error.message,
    });
  }
}