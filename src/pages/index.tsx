import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import TypewriterEffect from '@/components/TypewriterEffect';
import dynamic from 'next/dynamic';const LottiePlayer = dynamic(  () => import('@lottiefiles/react-lottie-player').then(mod => mod.Player),  { ssr: false }); 


const HOMEPAGE_TOOLS = [
  { name: 'AI Caption Master', icon: '✍️', href: '/tools/caption-gen' },
  { name: 'Meme Starter Kit', icon: '😂', href: '/tools/meme-maker' },
  { name: 'TikTok Viralizer', icon: '#️⃣', href: '/tools/hashtag-tool' },
  { name: 'Glitch My Profile', icon: '👾', href: '/tools/glitch-pfp' },
  { name: 'Mockup Genie', icon: '👕', href: '/tools/mockup-gen' },
  { name: 'Kenya Rates Hub', icon: '💰', href: '/tools/kenya-rates' },
  { name: 'Script-to-Scene', icon: '🎬', href: '/tools/script-to-scene' },
];

const INFINITE_SCROLL_TOOLS = [...HOMEPAGE_TOOLS, ...HOMEPAGE_TOOLS, ...HOMEPAGE_TOOLS];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1 },
};


const VALUE_PROPOSITIONS = [
  {
    title: 'AI-Powered Creativity',
    description: 'Leverage cutting-edge AI for instant captions, viral hashtags, and scene generation.',
    lottiePath: '/lottie/ai-brain.json',
    delay: 0.2
  },
  {
    title: 'Unleash Your Potential',
    description: 'Transform your ideas into stunning visuals with intuitive meme, glitch, and mockup tools.',
    lottiePath: '/lottie/lightbulb.json',
    delay: 0.4
  },
  {
    title: 'Hustle with Confidence',
    description: 'Access market insights, save your creations, and share them effortlessly across platforms.',
    lottiePath: '/lottie/rocket.json', 
    delay: 0.6
  },
  {
    title: 'Community Driven',
    description: 'Join a network of digital hustlers, share knowledge, and dominate together.',
    lottiePath: '/lottie/community.json', 
    delay: 0.8
  },
];


const HomePage: React.FC = () => {
  const {user, loading } = useAuth();
  const router = useRouter();
  const scrollControls = useAnimationControls();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const startScrolling = async () => {
      const distanceToScroll = -1088; 

      while (true) {
        if (!isHovering) {
          await scrollControls.start({
            x: [0, distanceToScroll],
            transition: {
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            },
          });
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    startScrolling();
  }, [scrollControls, isHovering]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <p className="text-2xl font-orbitron animate-pulse">Loading Jayverse...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center justify-center px-4 py-8 flex-grow"
    >
      <Head>
        <title>Jayverse Tools - Create. Hustle. Dominate.</title>
        <meta name="description" content="A multi-tool creative suite for digital hustlers, meme lords, content creators, and designers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center text-center w-full">
        <h1 className="text-6xl md:text-8xl font-orbitron text-jay-orange drop-shadow-neon glitch-text mb-4 holographic-text">
          Jayverse Tools
        </h1>
        <p className="text-xl md:text-2xl font-poppins text-jay-white mb-8">
          <TypewriterEffect
            text="Create. Hustle. Dominate."
            typingSpeed={120}
            pauseAfterType={3000}
            loop={true}
            className="text-jay-orange"
          />
        </p>

        <p className="text-md md:text-lg font-space-grotesk text-jay-gray-light mb-12 max-w-2xl">
          Your creative Swiss Army Knife for digital hustlers, meme lords, content creators, and designers. Get ready to amplify your craft.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          {!user && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={{
                  pulsate: {
                    boxShadow: [
                      "0 0 10px rgba(255, 165, 0, 0.7)",
                      "0 0 20px rgba(255, 165, 0, 0.9)",
                      "0 0 10px rgba(255, 165, 0, 0.7)"
                    ],
                    transition: {
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }
                  }
                }}
                initial="pulsate"
                animate="pulsate"
              >
                <Link href="/auth/login" className="px-8 py-3 bg-jay-orange text-jay-black font-bold rounded-2xl shadow-neon">
                    Join the Jayverse
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shadow-neon-outline"
              >
                <Link href="/tools/guest-explore" className="px-8 py-3 border border-jay-orange text-jay-orange font-bold rounded-2xl">
                    Explore as Guest
                </Link>
              </motion.div>
            </>
          )}
          {user && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={{
                  pulsate: {
                    boxShadow: [
                      "0 0 10px rgba(255, 165, 0, 0.7)",
                      "0 0 20px rgba(255, 165, 0, 0.9)",
                      "0 0 10px rgba(255, 165, 0, 0.7)"
                    ],
                    transition: {
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }
                  }
                }}
                initial="pulsate"
                animate="pulsate"
            >
              <Link href="/dashboard" className="px-8 py-3 bg-jay-orange text-jay-black font-bold rounded-2xl shadow-neon">
                  Go to Dashboard
              </Link>
            </motion.div>
          )}
        </div>


        <p className="text-xl font-orbitron text-jay-white mt-8 mb-6 holographic-text">Our Powerful Tools:</p>
        <motion.div
          className="w-full max-w-6xl py-6 bg-transparent rounded-2xl border border-jay-orange border-opacity-30 overflow-x-hidden whitespace-nowrap scrollbar-hide-force relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            className="inline-flex gap-8 px-8 py-2"
            animate={scrollControls}
            style={{ width: `calc(${INFINITE_SCROLL_TOOLS.length} * (128px + 32px))` }} // Adjusted width to accommodate more items
          >
            {INFINITE_SCROLL_TOOLS.map((tool, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(255, 165, 0, 0.6)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex flex-col items-center justify-center p-4 rounded-lg bg-jay-black/20 border border-jay-gray-dark text-jay-white flex-shrink-0 w-32 h-32 cursor-pointer"
                onClick={() => router.push(tool.href)}
              >
                <span className="text-4xl mb-2">{tool.icon}</span>
                <p className="text-sm font-poppins text-jay-white break-words whitespace-normal">{tool.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>


        <p className="text-md md:text-lg font-space-grotesk text-jay-gray-light mt-12 mb-8 max-w-2xl">
          More than just tools, Jayverse empowers your digital hustle. Discover why creators choose us:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mb-12">
          {VALUE_PROPOSITIONS.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prop.delay, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }}
              className="bg-jay-black/50 p-6 rounded-2xl border border-jay-orange border-opacity-50 shadow-inner-neon flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 mb-4 flex items-center justify-center">
                <LottiePlayer
                  src={prop.lottiePath}
                  autoplay={true}
                  loop={true}
                  style={{ width: '100%', height: '100%' }}

                />
              </div>
              <h3 className="text-xl font-orbitron text-jay-orange mb-2 holographic-text">{prop.title}</h3>
              <p className="text-sm font-poppins text-jay-gray-light">{prop.description}</p>
            </motion.div>
          ))}
        </div>


      </main>
    </motion.div>
  );
};

export default HomePage;
