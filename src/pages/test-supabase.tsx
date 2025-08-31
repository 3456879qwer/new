import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; 

const TestSupabasePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      console.log('TEST_SUPABASE_PAGE: Starting data fetch...'); // Debug 1
      try {

        const { data: fetchedData, error: fetchedError } = await supabase
          .from('trending_videos')
          .select('*');

        console.log('TEST_SUPABASE_PAGE: Supabase fetch completed.'); // Debug 2
        console.log('TEST_SUPABASE_PAGE: Fetched Data:', fetchedData); // Debug 3
        console.log('TEST_SUPABASE_PAGE: Fetched Error:', fetchedError); // Debug 4

        if (fetchedError) {
          console.error('TEST_SUPABASE_PAGE: Error from Supabase:', fetchedError);
          setError(fetchedError.message || 'Unknown error fetching data from Supabase.');
        } else {
          setData(fetchedData);
        }
      } catch (err: any) {
        console.error('TEST_SUPABASE_PAGE: Unexpected error in try-catch block:', err); // Debug 5
        setError(err.message || 'An unexpected error occurred during fetch.');
      } finally {
        setLoading(false);
        console.log('TEST_SUPABASE_PAGE: Loading state set to false.'); // Debug 6
      }
    }

    fetchData(); 
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'white', backgroundColor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontFamily: 'monospace', color: 'orange' }}>Loading test data... Please check your browser console and Network tab.</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
        <h1>Error fetching data:</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#ff4444', border: '1px solid #ff4444', padding: '10px' }}>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
      <h1>Supabase Test Data (Tech Rates):</h1>
      <pre style={{ whiteSpace: 'pre-wrap', border: '1px solid gray', padding: '10px' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestSupabasePage;