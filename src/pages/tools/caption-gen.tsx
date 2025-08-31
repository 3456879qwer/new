import Head from 'next/head';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; 
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedInput from '@/components/AnimatedInput';
import { useNotification } from '@/context/NotificationContext';

const CaptionGenPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();


  const [imageDescriptionText, setImageDescriptionText] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captionStyle, setCaptionStyle] = useState<string>('general');
  const [copyCaptionSuccess, setCopyCaptionSuccess] = useState<string | null>(null);



  useEffect(() => {
    if (copyCaptionSuccess) {
        const timer = setTimeout(() => setCopyCaptionSuccess(null), 2000);
        return () => clearTimeout(timer);
    }
  }, [copyCaptionSuccess]);

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [error]);


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message={authLoading ? "Authenticating Jayverse..." : "Generating Captions..."} />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }


  const generateCaptions = async () => {
    if (!imageDescriptionText.trim()) {
      showNotification('Please enter a description for your image.', 'info');
      return;
    }

    setLoading(true);
    setCaptions([]);
    setError(null);
    setCopyCaptionSuccess(null);

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDescriptionText: imageDescriptionText, // Pass text description
          style: captionStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate captions');
      }

      setCaptions(data.captions);
      showNotification('Captions generated successfully!', 'success');
    } catch (err: any) {
      console.error('Frontend caption generation error:', err);
      showNotification(`Caption generation failed: ${err.message || 'Unknown error'}`, 'error');
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyIndividualCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyCaptionSuccess('Caption copied!');
    setTimeout(() => setCopyCaptionSuccess(null), 2000);
  };

  const copyAllCaptions = () => {
    if (captions.length > 0) {
      const allText = captions.join('\n\n');
      navigator.clipboard.writeText(allText);
      setCopyCaptionSuccess('All captions copied!');
      setTimeout(() => setCopyCaptionSuccess(null), 2000);
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
        <title>AI Caption Master - Jayverse Tools</title>
        <meta name="description" content="Generate viral social media captions with AI." />
      </Head>

      <div className="w-full max-w-4xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">AI Caption Master</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Describe your image, choose a style, and get 5 unique AI-generated captions.
        </p>

        {/* Replaced Image Upload Area with Text Input */}
        <div className="mb-8 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50 space-y-4">
            <label htmlFor="imageDescription" className="block text-jay-white text-lg font-poppins mb-2 text-center">
                Describe your image:
            </label>
            <AnimatedInput
                as="textarea"
                id="imageDescription"
                value={imageDescriptionText}
                onChange={(e) => setImageDescriptionText(e.target.value)}
                textareaProps={{ rows: 4 }}
                placeholder="e.g., A golden retriever playing in a field of sunflowers during sunset."
                disabled={loading}
            />
        </div>

        {/* Caption Style Selection */}
        <div className="mb-8">
          <label htmlFor="captionStyle" className="block text-jay-white text-lg font-poppins mb-3 text-center">
            Choose Caption Style:
          </label>
          <select
            id="captionStyle"
            value={captionStyle}
            onChange={(e) => setCaptionStyle(e.target.value)}
            className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins text-center"
          >
            <option value="general">General (Engaging & Versatile)</option>
            <option value="funny">Funny & Witty</option>
            <option value="deep">Deep & Thought-Provoking</option>
            <option value="savage">Savage & Edgy</option>
            <option value="creative">Creative & Imaginative</option>
          </select>
        </div>

        {/* Generate Button */}
        <AnimatedButton
          onClick={generateCaptions}
          disabled={loading || !imageDescriptionText.trim()}
          className="w-full"
        >
          {loading ? 'Generating Captions...' : 'Generate 5 Captions'}
        </AnimatedButton>

        {/* Generated Captions Display */}
        {captions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-orbitron text-jay-orange mb-4 text-center holographic-text">Your Jayverse Captions:</h2>
            <div className="flex justify-center mb-4">
              <AnimatedButton
                onClick={copyAllCaptions}
                className="px-6 py-2"
                variant="secondary"
              >
                Copy All Captions
              </AnimatedButton>
            </div>
            <ul className="space-y-4">
              {captions.map((caption, index) => (
                <li key={index} className="bg-jay-black p-4 rounded-lg border border-jay-gray-dark font-poppins text-jay-white flex items-center justify-between">
                  <p className="flex-grow pr-4">{caption}</p>
                  <motion.button
                    onClick={() => copyIndividualCaption(caption)}
                    className="ml-4 p-2 bg-jay-orange text-jay-black rounded-md text-sm hover:bg-opacity-90 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Copy
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CaptionGenPage;