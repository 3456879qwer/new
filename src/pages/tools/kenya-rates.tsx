
import Head from 'next/head';
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // 🌟 Added useCallback 🌟
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedInput from '@/components/AnimatedInput';

interface RateEntry {
  id: string;
  created_at: string;
  role: string;
  rate_per_hour_ksh: number;
  experience_level: string;
  location?: string;
  notes?: string;
  user_id?: string;
}

const KenyaRatesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [allRates, setAllRates] = useState<RateEntry[]>([]); // Store all fetched rates
  const [loadingRates, setLoadingRates] = useState(true); // True initially
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);


  const [role, setRole] = useState('');
  const [rate, setRate] = useState<string>('');
  const [experience, setExperience] = useState('Junior');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');


  const [filterRole, setFilterRole] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const experienceLevels = ['Junior', 'Mid', 'Senior', 'Lead'];


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message="Authenticating Jayverse..." />
      </div>
    );
  }


  if (!user) {
    router.push('/auth/login');
    return null;
  }


  const fetchRates = useCallback(async () => {
    setLoadingRates(true); 
    setSubmissionError(null); 

    console.log('DEBUG_RATES: fetchRates function initiated...'); // Debug A
    try {
      console.log('DEBUG_RATES: Before Supabase select query...'); // Debug B
      const { data, error } = await supabase
        .from('tech_rates')
        .select('*');

      console.log('DEBUG_RATES: After Supabase select query. Data:', data); // Debug C
      console.log('DEBUG_RATES: After Supabase select query. Error:', error); // Debug D

      if (error) {
        console.error('DEBUG_RATES: Error object from Supabase:', error); // Debug E
        setSubmissionError(`Failed to load rates: ${error.message || 'Unknown Supabase error'}`);
        setAllRates([]); // Clear rates on error
      } else {
        setAllRates(data as RateEntry[]);
        console.log(`DEBUG_RATES: Successfully fetched ${data ? data.length : 0} rates.`); // Debug F
      }
    } catch (err: any) {
      console.error('DEBUG_RATES: UNEXPECTED ERROR IN fetchRates try-catch block:', err); // Debug G
      setSubmissionError(`An unexpected error occurred while fetching rates: ${err.message || 'Unknown'}`);
      setAllRates([]);
    } finally {
      setLoadingRates(false);
      console.log('DEBUG_RATES: Finally block executed. Setting loadingRates to false.'); // Debug H
    }
  }, []); 



  useEffect(() => {
    console.log('DEBUG_RATES: useEffect triggering fetchRates()... (user state available)'); // Debug I
    fetchRates(); 

    const subscription = supabase
      .channel('tech_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tech_rates' }, payload => {
        console.log('DEBUG_RATES: Realtime change received for tech_rates!', payload); // Debug J
        fetchRates(); 
      })
      .subscribe();

    return () => {
      console.log('DEBUG_RATES: Cleaning up tech_rates subscription. Removing channel.'); // Debug K
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, fetchRates]); 


  // Filter and Sort Logic (useMemo)
  const filteredAndSortedRates = useMemo(() => {
    let filtered = [...allRates];

    // Apply text search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rate) =>
          rate.role.toLowerCase().includes(lowerCaseSearch) ||
          (rate.location && rate.location.toLowerCase().includes(lowerCaseSearch)) ||
          (rate.notes && rate.notes.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter((rate) => rate.role === filterRole);
    }

    // Apply experience filter
    if (filterExperience) {
      filtered = filtered.filter((rate) => rate.experience_level === filterExperience);
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter((rate) => rate.location === filterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rate_per_hour_ksh') {
        comparison = (a.rate_per_hour_ksh || 0) - (b.rate_per_hour_ksh || 0);
      } else if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allRates, searchTerm, filterRole, filterExperience, filterLocation, sortBy, sortOrder]);


  // Basic Analytics Calculations (useMemo)
  const analytics = useMemo(() => {
    if (filteredAndSortedRates.length === 0) {
      return { totalSubmissions: 0, averageRate: 0, highestRate: 0, lowestRate: 0 };
    }

    const ratesArray = filteredAndSortedRates.map(item => item.rate_per_hour_ksh || 0);
    const sum = ratesArray.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / ratesArray.length;
    const highest = Math.max(...ratesArray);
    const lowest = Math.min(...ratesArray);

    return {
      totalSubmissions: filteredAndSortedRates.length,
      averageRate: Math.round(avg),
      highestRate: highest,
      lowestRate: lowest,
    };
  }, [filteredAndSortedRates]);


  // Handle rate submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmissionError('You must be logged in to submit a rate.');
      return;
    }
    if (!role || !rate || !experience) {
      setSubmissionError('Role, Rate, and Experience are required fields.');
      return;
    }
    if (isNaN(parseFloat(rate)) || parseFloat(rate) <= 0) {
      setSubmissionError('Please enter a valid positive number for the rate.');
      return;
    }

    setSubmissionLoading(true);
    setSubmissionError(null);
    setFormSuccess(null);

    const newRate = {
      role: role.trim(),
      rate_per_hour_ksh: parseFloat(rate),
      experience_level: experience,
      location: location.trim() || null,
      notes: notes.trim() || null,
      user_id: user.id,
    };

    const { error } = await supabase
      .from('tech_rates')
      .insert([newRate]);

    if (error) {
      console.error('Error submitting rate:', error);
      setSubmissionError(error.message);
    } else {
      setFormSuccess('Rate submitted successfully!');
      setRole('');
      setRate('');
      setExperience('Junior');
      setLocation('');
      setNotes('');
    }
    setSubmissionLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow text-jay-white"
    >
      <Head>
        <title>Kenya Tech Rates Hub - Jayverse Tools</title>
        <meta name="description" content="Crowdsourced freelance tech rates for Kenya." />
      </Head>

      <div className="w-full max-w-5xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Kenya Tech Rates Hub</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Share your freelance tech rates and see what others are charging in Kenya!
        </p>

        {/* Submission Form */}
        <div className="mb-12 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50">
          <h2 className="text-2xl font-orbitron text-jay-white mb-6 text-center holographic-text">Submit Your Rate</h2>
          {!user && (
            <p className="text-center text-red-400 font-poppins mb-4">
              You must be logged in to submit a rate.
            </p>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-jay-white text-lg font-poppins mb-2">Role/Niche:</label>
              <AnimatedInput
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Web Developer, UI Designer"
                disabled={submissionLoading || !user}
                required
              />
            </div>
            <div>
              <label htmlFor="rate" className="block text-jay-white text-lg font-poppins mb-2">Rate (Ksh/hour):</label>
              <AnimatedInput
                type="number"
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g., 2500"
                disabled={submissionLoading || !user}
                required
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-jay-white text-lg font-poppins mb-2">Experience Level:</label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                disabled={submissionLoading || !user}
                required
              >
                {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-jay-white text-lg font-poppins mb-2">Location (Optional):</label>
              <AnimatedInput
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Nairobi, Remote"
                disabled={submissionLoading || !user}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-jay-white text-lg font-poppins mb-2">Notes (Optional):</label>
              <AnimatedInput
                as="textarea"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                textareaProps={{ rows: 3 }}
                placeholder="e.g., Specializes in React, offers mentorship"
                disabled={submissionLoading || !user}
              />
            </div>
            <div className="md:col-span-2 text-center">
              <AnimatedButton
                type="submit"
                disabled={submissionLoading || !user}
                className="py-3 px-8"
              >
                {submissionLoading ? 'Submitting...' : 'Submit My Rate'}
              </AnimatedButton>
            </div>
          </form>
          {submissionError && (
            <p className="text-red-500 text-center mt-4 font-poppins">{submissionError}</p>
          )}
          {formSuccess && (
            <p className="text-green-400 text-center mt-4 font-poppins">{formSuccess}</p>
          )}
        </div>
        
        {/* Basic Analytics Display */}
        <div className="mb-12 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50 text-center">
            <h2 className="text-2xl font-orbitron text-jay-orange mb-4 holographic-text">Market Insights</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-jay-white font-poppins">
                <div>
                    <p className="text-jay-gray-light text-sm">Total Submissions</p>
                    <p className="text-2xl font-bold text-jay-orange">{analytics.totalSubmissions}</p>
                </div>
                <div>
                    <p className="text-jay-gray-light text-sm">Average Rate</p>
                    <p className="text-2xl font-bold text-jay-orange">Ksh {analytics.averageRate.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-jay-gray-light text-sm">Highest Rate</p>
                    <p className="text-2xl font-bold text-jay-orange">Ksh {analytics.highestRate.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-jay-gray-light text-sm">Lowest Rate</p>
                    <p className="text-2xl font-bold text-jay-orange">Ksh {analytics.lowestRate.toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* Filtering and Sorting Controls */}
        <div className="mb-8 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50 space-y-4">
            <h2 className="text-2xl font-orbitron text-jay-white mb-6 text-center holographic-text">Filter & Sort Rates</h2>
            
            {/* Search Input */}
            <div>
                <label htmlFor="searchTerm" className="block text-jay-white text-lg font-poppins mb-2">Search:</label>
                <AnimatedInput
                    type="text"
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by role, location, or notes"
                    className="w-full"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div>
                    <label htmlFor="filterRole" className="block text-jay-white text-lg font-poppins mb-2">Filter by Role:</label>
                    <select
                        id="filterRole"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                        <option value="">All Roles</option>
                        {Array.from(new Set(allRates.map(r => r.role))).sort().map(roleOption => (
                            <option key={roleOption} value={roleOption}>{roleOption}</option>
                        ))}
                    </select>
                </div>

                {/* Experience Filter */}
                <div>
                    <label htmlFor="filterExperience" className="block text-jay-white text-lg font-poppins mb-2">Filter by Experience:</label>
                    <select
                        id="filterExperience"
                        value={filterExperience}
                        onChange={(e) => setFilterExperience(e.target.value)}
                        className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                        <option value="">All Levels</option>
                        {experienceLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                {/* Location Filter */}
                <div>
                    <label htmlFor="filterLocation" className="block text-jay-white text-lg font-poppins mb-2">Filter by Location:</label>
                    <select
                        id="filterLocation"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                        <option value="">All Locations</option>
                        {Array.from(new Set(allRates.map(r => r.location).filter(Boolean) as string[])).sort().map(locOption => (
                            <option key={locOption} value={locOption}>{locOption}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sorting Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="sortBy" className="block text-jay-white text-lg font-poppins mb-2">Sort By:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                        <option value="created_at">Date Submitted</option>
                        <option value="rate_per_hour_ksh">Rate (Ksh/hr)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sortOrder" className="block text-jay-white text-lg font-poppins mb-2">Sort Order:</label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Display Rates */}
        <h2 className="text-2xl font-orbitron text-jay-white mb-6 text-center holographic-text">Current Rates</h2>
        {filteredAndSortedRates.length === 0 ? (
          <p className="text-center text-jay-gray-light font-poppins">No rates match your filters. Try adjusting them!</p>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-jay-gray-dark">
            <table className="w-full text-sm text-left text-jay-white font-poppins">
              <thead className="text-xs text-jay-orange uppercase bg-jay-black">
                <tr>
                  <th scope="col" className="py-3 px-6">Role</th>
                  <th scope="col" className="py-3 px-6">Rate (Ksh/hr)</th>
                  <th scope="col" className="py-3 px-6">Experience</th>
                  <th scope="col" className="py-3 px-6">Location</th>
                  <th scope="col" className="py-3 px-6">Notes</th>
                  <th scope="col" className="py-3 px-6">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRates.map((entry) => (
                  <tr key={entry.id} className="bg-jay-gray-dark border-b border-jay-black hover:bg-jay-dark transition-colors duration-150">
                    <td className="py-4 px-6 font-medium text-jay-white whitespace-nowrap">{entry.role}</td>
                    <td className="py-4 px-6 text-jay-orange font-bold">Ksh {entry.rate_per_hour_ksh.toLocaleString()}</td>
                    <td className="py-4 px-6">{entry.experience_level}</td>
                    <td className="py-4 px-6">{entry.location || 'N/A'}</td>
                    <td className="py-4 px-6 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={entry.notes || 'No notes'}>{entry.notes || 'N/A'}</td>
                    <td className="py-4 px-6 text-jay-gray-light">{new Date(entry.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KenyaRatesPage;