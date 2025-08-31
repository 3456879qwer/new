import Head from 'next/head';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GetServerSideProps } from 'next'; 
import { createClient } from '@supabase/supabase-js'; 


import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';

interface TrendingVideo {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  video_url: string;
  rank: number;
  display_date: string; // YYYY-MM-DD format
}


const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const todayDate = getTodayDate();

  console.log('GETSERVERSIDEPROPS: Running on server for /trending-memes');
  console.log('GETSERVERSIDEPROPS: Supabase URL loaded:', !!supabaseUrl);
  console.log('GETSERVERSIDEPROPS: Supabase Anon Key loaded:', !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('GETSERVERSIDEPROPS: Missing Supabase URL or Anon Key environment variables');
    return {
      props: {
        trendingVideos: [],
        error: "Server configuration error: Supabase keys missing. Please check .env.local",
      },
    };
  }


  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log(`GETSERVERSIDEPROPS: Fetching trending videos for date: ${todayDate}`);

    const { data, error: fetchError } = await supabase
      .from('trending_videos')
      .select('*')
      .eq('display_date', todayDate)
      .order('rank', { ascending: true });

    if (fetchError) {
      console.error('GETSERVERSIDEPROPS: Error fetching trending videos from Supabase:', fetchError);
      return {
        props: {
          trendingVideos: [],
          error: `Failed to load trending videos: ${fetchError.message || 'Unknown error'}`,
        },
      };
    }

    return {
      props: {
        trendingVideos: data as TrendingVideo[],
        error: null,
      },
    };
  } catch (err: any) {
    console.error('GETSERVERSIDEPROPS: Unexpected error during fetch:', err);
    return {
      props: {
        trendingVideos: [],
        error: `An unexpected server error occurred: ${err.message || 'Unknown error'}`,
      },
    };
  }
};



const TrendingMemesPage: React.FC<{ trendingVideos: TrendingVideo[]; error: string | null }> = ({ trendingVideos, error }) => {
  const { loading: authLoading } = useAuth(); // Still need auth loading for CyberLoader
  const router = useRouter();

  // No longer need client-side states for trendingVideos, loadingVideos, or error
  // Their data/status is now provided by props

  const [isMuted, setIsMuted] = useState(true); // Still need for mute toggle

  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);


  useEffect(() => {
    // Only set up observer if there are videos
    if (trendingVideos.length === 0) {
      return; 
    }

    const observerOptions = {
      root: carouselRef.current,
      rootMargin: '0px',
      threshold: 0.9,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          videoElement.play().catch(e => console.warn("Video auto-play suppressed:", e));
        } else {
          videoElement.pause();
          videoElement.currentTime = 0;
        }
      });
    }, observerOptions);

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
      // Clean up refs array to avoid stale references, especially in SSR context
      videoRefs.current = []; 
    };
  }, [trendingVideos]); 


  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      videoRefs.current.forEach(video => {
        if (video) video.muted = newState;
      });
      return newState;
    });
  };

  const scrollToVideo = (index: number) => {
    const targetVideo = videoRefs.current[index];
    if (targetVideo && carouselRef.current) {
        const containerWidth = carouselRef.current.offsetWidth;
        const videoWidth = targetVideo.offsetWidth;
        const scrollLeft = targetVideo.offsetLeft - (containerWidth - videoWidth) / 2;
        
        carouselRef.current.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const itemWidth = videoRefs.current[0]?.offsetWidth || 0;
      const nextScroll = currentScroll + itemWidth;
      carouselRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const itemWidth = videoRefs.current[0]?.offsetWidth || 0;
      const prevScroll = currentScroll - itemWidth;
      carouselRef.current.scrollTo({ left: prevScroll, behavior: 'smooth' });
    }
  };



  if (authLoading) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message="Authenticating Jayverse..." />
      </div>
    );
  }


  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow text-jay-white"
      >
        <Head>
          <title>Error - Jayverse Tools</title>
        </Head>
        <div className="w-full max-w-6xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-red-500 border-opacity-50 shadow-inner-neon text-center">
          <h1 className="text-4xl font-orbitron text-red-500 mb-4 holographic-text">Error Loading Memes</h1>
          <p className="text-lg font-poppins text-red-300">{error}</p>
          <p className="text-sm text-jay-gray-light mt-4">Please try refreshing the page. If the problem persists, check your Supabase configuration and internet connection.</p>
        </div>
      </motion.div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow text-jay-white"
    >
      <Head>
        <title>Today's Trending Memes - Jayverse Tools</title>
        <meta name="description" content="Top 10 trending video memes daily on Jayverse Tools." />
      </Head>

      <div className="w-full max-w-6xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Today's Top Trending Memes</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Curated daily for your viewing pleasure. Stay viral!
        </p>

        {trendingVideos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl font-poppins text-jay-gray-light mb-4">No trending memes for today yet!</p>
            <p className="font-poppins text-jay-gray-light">
              Check back later, or contact us if you're the curator 😉
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center space-x-4 mb-6">
                <motion.button
                    onClick={scrollPrev}
                    className="p-2 rounded-full bg-jay-orange text-jay-black shadow-neon text-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </motion.button>

                <motion.button
                    onClick={toggleMute}
                    className="px-6 py-2 bg-jay-orange text-jay-black font-bold rounded-full text-sm flex items-center space-x-2 shadow-neon"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isMuted ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 011.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Unmute</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 2a6 6 0 00-6 6v3a4 4 0 00-.897 2.18M10 2a6 6 0 016 6v3a4 4 0 01-.897 2.18m0 0A5 5 0 0115 15v2a2 2 0 11-4 0v-2a5 5 0 01-.897-2.18zm-4-.82m0 0A5 5 0 015 15v2a2 2 0 11-4 0v-2a5 5 0 01-.897-2.18z" />
                            </svg>
                            <span>Mute</span>
                        </>
                    )}
                </motion.button>

                <motion.button
                    onClick={scrollNext}
                    className="p-2 rounded-full bg-jay-orange text-jay-black shadow-neon text-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </motion.button>
            </div>

            <div
              ref={carouselRef}
              className="flex w-full overflow-x-scroll snap-x snap-mandatory scrollbar-hide-force scroll-smooth"
              style={{ scrollPadding: '0 20px' }}
            >
              {trendingVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="flex-shrink-0 w-full md:w-3/4 lg:w-2/3 snap-center bg-jay-black p-6 rounded-lg border border-jay-orange border-opacity-50 shadow-md flex flex-col items-center text-center relative mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }}
                  style={{ minHeight: '600px', maxWidth: '800px'}}
                >
                    <motion.div
                        className="absolute -top-4 -left-4 w-16 h-16 bg-jay-orange text-jay-black rounded-full flex items-center justify-center font-orbitron text-3xl font-bold border-2 border-jay-black shadow-lg z-10"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.6, type: "spring", stiffness: 200, damping: 10 }}
                    >
                        {video.rank}
                    </motion.div>

                  <h2 className="text-3xl font-orbitron text-jay-orange mb-4 holographic-text mt-4">
                    {video.title}
                  </h2>
                  {video.description && (
                    <p className="text-jay-gray-light font-poppins mb-4">{video.description}</p>
                  )}
                  <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-4 border border-jay-gray-dark video-holographic-frame">
                    <video
                      ref={el => { if (el) videoRefs.current[index] = el; }}
                      controls={false}
                      src={video.video_url}
                      className="w-full h-full object-contain rounded-md"
                      muted={isMuted}
                      loop
                      playsInline
                      preload="metadata"
                      autoPlay={true} 
                    >
                      Your browser does not support the video tag.
                    </video>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        onClick={(e) => {
                            const videoElement = videoRefs.current[index];
                            if (videoElement) {
                                if (videoElement.paused) {
                                    videoElement.play();
                                } else {
                                    videoElement.pause();
                                }
                            }
                            e.stopPropagation();
                        }}
                    >
                        <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/> {/* Play icon */}
                        </svg>
                    </motion.div>
                  </div>
                  <p className="text-sm text-jay-gray-light font-poppins">Uploaded: {new Date(video.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TrendingMemesPage;