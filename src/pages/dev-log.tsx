import Head from 'next/head';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Import Link for potential internal links

interface DevLogEntry {
  id: string;
  title: string;
  date: string; // Format: "Month Day, Year"
  description: string;
  highlights: string[]; // Key features or fixes
}


const DEV_LOG_ENTRIES: DevLogEntry[] = [
  {
    id: 'v1.0.0-launch',
    title: 'Jayverse Tools Launched!',
    date: 'July 18, 2025',
    description: 'Welcome to Jayverse Tools! Your ultimate creative suite for digital hustlers. We\'re launching with a powerful set of tools designed to amplify your content creation.',
    highlights: [
      '- AI Caption Master:  Get viral captions instantly.',
      '- Meme Starter Kit:  Craft hilarious memes with custom text.',
      '- TikTok Hashtag Viralizer:  Generate trending hashtags.',
      '- Glitch My Profile:  Apply cyberpunk effects to your PFPs.',
      '- Mockup Genie:  See your logos on various products.',
      '- Kenya Tech Rates Hub:  Crowdsourced freelance tech rates.',
      '- Script-to-Scene:  Turn text into visuals (AI-powered, currently mocked).',
      '- User Authentication:  Secure login with email/password and Google.',
      '- My Jayverse Gallery:  Save your creations to your personal cloud!',
    ],
  },
  {
    id: 'v1.0.1-visual-fx',
    title: 'Major Visual Upgrade!',
    date: 'July 19, 2025', 
    description: 'We\'ve just pushed a massive visual overhaul to make your Jayverse experience even more immersive and unique!',
    highlights: [
      '- Fluid Page Transitions:  Enjoy smooth animations between pages.',
      '- Animated Background:  A subtle, dynamic background gradient with flowing particles.',
      '- Holographic Text:  Main titles now shimmer and flicker with neon glow.',
      '- Animated Buttons & Inputs:  More responsive and visually engaging UI elements.',
      '- 3D Dashboard Cards:  Dashboard tool cards now subtly tilt on hover!',
      '- Custom Scrollbar:  A sleek, themed scrollbar to match the dark aesthetic.',
      '- Custom Cursor:  A subtle, animated dot that follows your mouse.',
      '- Semi-Transparent Panels:  Tool and auth pages now blend seamlessly with the background.',
    ],
  },
  {
    id: 'v1.0.2-tool-enhancements',
    title: 'Tools Level Up!',
    date: 'July 20, 2025', 
    description: 'We\'ve added significant new features to your favorite tools, making your creative workflow even smoother.',
    highlights: [
      '- Meme Starter Kit: Now upload your own images as templates! Plus, add drop shadows to your text!',
      '- All Image Tools (Meme, Glitch, Mockup, Script-to-Scene): Integrated "Save to Gallery" functionality!',
      '- All Image Tools: Added "Copy Public Link" for easy sharing of saved creations.',
      '- AI Caption Master: New "Copy All Captions" button for quick text transfer.',
      '- Kenya Tech Rates Hub: Advanced filtering, sorting, and basic analytics  (Average, High, Low rates) for market insights.',
    ],
  },

];


const DevLogPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow text-jay-white"
    >
      <Head>
        <title>What's New? - Jayverse Tools Dev Log</title>
        <meta name="description" content="Stay updated with the latest features and improvements in Jayverse Tools." />
      </Head>

      <div className="w-full max-w-4xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">What's New?</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Stay up-to-date with the latest features, improvements, and fixes in the Jayverse!
        </p>

        <div className="space-y-12">
          {DEV_LOG_ENTRIES.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * DEV_LOG_ENTRIES.indexOf(entry) }}
              className="p-6 bg-jay-black rounded-lg border border-jay-gray-dark border-opacity-70 shadow-md"
            >
              <h2 className="text-3xl font-orbitron text-jay-orange mb-2 holographic-text">{entry.title}</h2>
              <p className="text-sm font-space-grotesk text-jay-gray-light mb-4">{entry.date}</p>
              <p className="font-poppins text-jay-white mb-4">{entry.description}</p>
              
              {entry.highlights.length > 0 && (
                <>
                  <p className="text-jay-orange font-bold text-sm mb-2">Highlights:</p>
                  <ul className="list-disc list-inside text-jay-gray-light font-poppins text-sm space-y-1">
                    {entry.highlights.map((highlight, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: highlight }} /> 
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-jay-gray-light font-poppins mt-12">
          Want to suggest a feature? Drop us a line on social media!
        </p>
      </div>
    </motion.div>
  );
};

export default DevLogPage;