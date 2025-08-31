import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion'; 
import CyberLoader from '@/components/CyberLoader';

const HashtagToolPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message={authLoading ? "Authenticating Jayverse..." : "Generating Hashtags..."} />
      </div>
    );
  }


  if (!user) {
    router.push('/auth/login');
    return null; 
  }

  const generateHashtags = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate hashtags.');
      return;
    }

    setLoading(true);
    setHashtags([]);
    setError(null);
    setCopySuccess(null);

    try {
      const response = await fetch('/api/generate-hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate hashtags');
      }

      setHashtags(data.hashtags);
    } catch (err: any) {
      console.error('Frontend hashtag generation error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const copyAllHashtags = () => {
    if (hashtags.length > 0) {
      const allTags = hashtags.join(' ');
      navigator.clipboard.writeText(allTags);
      setCopySuccess('All hashtags copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    }
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
        <title>TikTok Viralizer - Jayverse Tools</title>
        <meta name="description" content="Get viral hashtag combinations for TikTok content." />
      </Head>


      <div className="w-full max-w-3xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">TikTok Hashtag Viralizer</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Enter a topic, and our AI will generate a list of viral hashtags to boost your TikTok reach!
        </p>

        {/* Topic Input */}
        <div className="mb-8">
          <label htmlFor="topicInput" className="block text-jay-white text-lg font-poppins mb-3 text-center">
            Enter Your Topic/Niche:
          </label>
          <input
            type="text"
            id="topicInput"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
            placeholder="e.g., 'coding tips', 'gaming highlights', 'DIY crafts'"
            disabled={loading}
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={generateHashtags}
          disabled={loading || !topic.trim()}
          className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 transform ${
            loading || !topic.trim()
              ? 'bg-jay-gray-light text-jay-gray-dark cursor-not-allowed'
              : 'bg-jay-orange text-jay-black hover:bg-opacity-90 hover:scale-105 shadow-neon'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Generating Hashtags...' : 'Generate Viral Hashtags'}
        </motion.button>

        {/* Error Display */}
        {error && (
          <p className="text-red-500 text-center mt-4 font-poppins">{error}</p>
        )}

        {/* Copy Success Message */}
        {copySuccess && (
          <p className="text-green-400 text-center mt-4 font-poppins animate-fade-in-out">{copySuccess}</p>
        )}

        {/* Generated Hashtags Display */}
        {hashtags.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-orbitron text-jay-orange mb-4 text-center holographic-text">Your Viral Hashtags:</h2>
            <div className="flex justify-center mb-4">
              <motion.button
                onClick={copyAllHashtags}
                className="px-6 py-2 bg-jay-gray-light text-jay-black font-bold rounded-xl hover:bg-jay-orange hover:text-jay-black transition-colors duration-200 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Copy All Hashtags
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-jay-black text-jay-orange border border-jay-orange px-3 py-1 rounded-full text-sm font-poppins cursor-pointer hover:bg-jay-orange hover:text-jay-black transition-colors duration-200"
                  onClick={() => copyToClipboard(tag)}
                  title="Click to copy"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HashtagToolPage;