import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedDivider from '@/components/AnimatedDivider';
import Image from 'next/image';
import CyberLoader from '@/components/CyberLoader';

interface DailyFeature {
  id: string;
  created_at: string;
  display_date: string;
  type: 'challenge' | 'featured_creation';
  challenge_text?: string;
  featured_item_id?: string;
  featured_item_title?: string;
  featured_item_url?: string;
}


const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [loadingProfileData, setLoadingProfileData] = useState(true);

  const [dailyFeature, setDailyFeature] = useState<DailyFeature | null>(null);
  const [loadingDailyFeature, setLoadingDailyFeature] = useState(true);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      const getProfileData = async () => {
        setLoadingProfileData(true);
        try {
          const { data: profile, error, status } = await supabase
            .from('profiles')
            .select(`username, avatar_url`)
            .eq('id', user.id)
            .single();

          if (error && status !== 406) {
            throw error;
          }

          if (profile) {
            setProfileUsername(profile.username);
            setProfileAvatarUrl(profile.avatar_url);
          } else {
            const defaultUsername = user.email?.split('@')[0] || 'New User';
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.id, username: defaultUsername });

            if (insertError) {
              console.error('Error creating initial dashboard profile:', insertError);
              setProfileUsername('Error User');
            } else {
              setProfileUsername(defaultUsername);
            }
          }
        } catch (err: any) {
          console.error('Error fetching dashboard profile:', err);
          setProfileUsername('Guest User');
        } finally {
          setLoadingProfileData(false);
        }
      };
      getProfileData();
    }

    const getDailyFeature = async () => {
      setLoadingDailyFeature(true);
      const todayDate = getTodayDate();
      try {
        const { data, error, status } = await supabase
          .from('daily_features')
          .select('*')
          .eq('display_date', todayDate)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setDailyFeature(data as DailyFeature);
        } else {
          setDailyFeature(null);
        }
      } catch (err: any) {
        console.error('Error fetching daily feature:', err);
        setDailyFeature(null);
      } finally {
        setLoadingDailyFeature(false);
      }
    };
    getDailyFeature();

  }, [user, authLoading, router]);


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
    }
  };

  if (authLoading || loadingProfileData || loadingDailyFeature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message={authLoading ? "Authenticating Jayverse..." : "Loading Dashboard..."} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow"
    >
      <Head>
        <title>Jayverse Dashboard - Your Creative Hub</title>
      </Head>

      <header className="w-full max-w-6xl flex justify-between items-center py-6 mb-8">
        <h1 className="text-4xl font-orbitron text-jay-orange holographic-text">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-jay-gray-dark border border-jay-orange flex items-center justify-center">
              {profileAvatarUrl ? (
                <Image
                  src={profileAvatarUrl}
                  alt="Avatar"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <span className="text-xl" role="img" aria-label="default avatar">👤</span>
              )}
            </div>
            <span className="text-lg font-poppins text-jay-white">{profileUsername || user.email?.split('@')[0] || 'Jayverse User'}!</span>
          </div>
          <AnimatedButton
            onClick={handleLogout}
            variant="secondary"
            className="text-sm"
          >
            Logout
          </AnimatedButton>
        </div>
      </header>
      <AnimatedDivider className="mb-8" />

      <main className="w-full max-w-6xl flex flex-col items-center">

        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: 1, scale: 1 },
            }}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-jay-black/50 p-6 rounded-2xl border border-jay-orange border-opacity-50 shadow-inner-neon w-full mb-12 max-w-md text-center"
            style={{ perspective: 1000 }}
        >
            {dailyFeature ? (
                <>
                    <h2 className="text-3xl font-orbitron text-jay-orange mb-4 holographic-text">
                        {dailyFeature.type === 'challenge' ? 'Daily Challenge!' : 'Featured Creation!'}
                    </h2>
                    {dailyFeature.type === 'challenge' && dailyFeature.challenge_text && (
                        <p className="text-xl font-poppins text-jay-white mb-4">
                            "{dailyFeature.challenge_text}"
                        </p>
                    )}
                    {dailyFeature.type === 'featured_creation' && (dailyFeature.featured_item_url || dailyFeature.featured_item_title) && (
                        <>
                            {dailyFeature.featured_item_url && (
                                <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-4 border border-jay-gray-dark">
                                    {dailyFeature.featured_item_url.match(/\.(jpeg|jpg|gif|png|svg)$/) ? (
                                        <Image
                                            src={dailyFeature.featured_item_url}
                                            alt={dailyFeature.featured_item_title || 'Featured Creation'}
                                            layout="fill"
                                            objectFit="contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <video
                                            controls={false}
                                            src={dailyFeature.featured_item_url}
                                            className="w-full h-full object-contain rounded-md"
                                            muted={true}
                                            loop
                                            playsInline
                                            autoPlay={true}
                                            preload="metadata"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                            )}
                            <p className="text-lg font-poppins text-jay-white">
                                {dailyFeature.featured_item_title || 'Untitled Creation'}
                            </p>
                            {dailyFeature.featured_item_id && (
                                <Link href={`/dashboard/gallery#${dailyFeature.featured_item_id}`} className="text-jay-orange hover:underline text-sm mt-2 block">
                                    View in Gallery
                                </Link>
                            )}
                        </>
                    )}
                    <p className="text-sm text-jay-gray-light mt-4">
                        Today's Feature: {new Date(dailyFeature.display_date).toLocaleDateString()}
                    </p>
                </>
            ) : (
                <p className="text-xl font-poppins text-jay-gray-light">
                    No special feature for today. Check back tomorrow!
                </p>
            )}
        </motion.div>


        <p className="text-xl font-poppins text-jay-gray-light mb-12">
          Select a tool to get started:
        </p>
        

        <div className="flex flex-col md:flex-row gap-8 w-full justify-center mb-12"> {/* Added mb-12 here */}

            <motion.div
                variants={{
                    hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 },
                    show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 },
                }}
                whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)",
                    rotateX: 5,
                    rotateY: 5,
                }}
                whileTap={{ scale: 0.98, rotateX: 2, rotateY: 2 }}
                className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer w-full max-w-sm" // Removed mb-12
            >
                <Link href="/dashboard/gallery" className="flex flex-col items-center justify-center w-full h-full">
                    <span className="text-6xl mb-4" role="img" aria-label="gallery">🖼️</span>
                    <h3 className="text-2xl font-orbitron text-jay-orange mb-2">My Jayverse Gallery</h3>
                    <p className="text-jay-gray-light font-poppins">View and manage your saved creations.</p>
                </Link>
            </motion.div>


            <motion.div
                variants={{
                    hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 },
                    show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 },
                }}
                whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)",
                    rotateX: -5,
                    rotateY: 5,
                }}
                whileTap={{ scale: 0.98, rotateX: -2, rotateY: 2 }}
                className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer w-full max-w-sm" // Removed mb-12
            >
                <Link href="/dashboard/profile" className="flex flex-col items-center justify-center w-full h-full">
                    <span className="text-6xl mb-4" role="img" aria-label="profile">👤</span>
                    <h3 className="text-2xl font-orbitron text-jay-orange mb-2">My Profile</h3>
                    <p className="text-jay-gray-light font-poppins">Manage your account and view stats.</p>
                </Link>
            </motion.div>
        </div> 
        
        <p className="text-xl font-poppins text-jay-gray-light mb-12">
          Or explore individual tools:
        </p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
          style={{ perspective: 1000 }}
        >

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 },
              show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 },
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)",
              rotateX: 5, 
              rotateY: -5,
            }}
            whileTap={{ scale: 0.98, rotateX: 2, rotateY: -2 }} // Slight tilt on tap
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer" // Add cursor-pointer
          >
            <Link href="/tools/caption-gen" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="caption">✍️</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">AI Caption Master</h3>
              <p className="text-jay-gray-light font-poppins">Get viral captions for your content.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: 5, rotateY: 5 }}
            whileTap={{ scale: 0.98, rotateX: 2, rotateY: 2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/meme-maker" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="meme">😂</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">Meme Starter Kit</h3>
              <p className="text-jay-gray-light font-poppins">Craft hilarious memes instantly.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: -5, rotateY: 5 }}
            whileTap={{ scale: 0.98, rotateX: -2, rotateY: 2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/hashtag-tool" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="hashtag">#️⃣</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">TikTok Viralizer</h3>
              <p className="text-jay-gray-light font-poppins">Find the best hashtags for TikTok.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: 5, rotateY: -5 }}
            whileTap={{ scale: 0.98, rotateX: 2, rotateY: -2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/glitch-pfp" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="glitch">👾</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">Glitch My Profile</h3>
              <p className="text-jay-gray-light font-poppins">Upload pic & apply glitch/cyberpunk filters.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: -5, rotateY: -5 }}
            whileTap={{ scale: 0.98, rotateX: -2, rotateY: -2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/mockup-gen" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="mockup">👕</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">Mockup Genie</h3>
              <p className="text-jay-gray-light font-poppins">Upload logo & preview on products.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: 5, rotateY: 5 }}
            whileTap={{ scale: 0.98, rotateX: 2, rotateY: 2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/kenya-rates" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="rates">💰</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">Kenya Tech Rates Hub</h3>
              <p className="text-jay-gray-light font-poppins">Crowdsourced freelance rates dashboard.</p>
            </Link>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }, show: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 } }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 165, 0, 0.8), inset 0 0 8px rgba(255, 165, 0, 0.5)", rotateX: -5, rotateY: -5 }}
            whileTap={{ scale: 0.98, rotateX: -2, rotateY: -2 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon cursor-pointer"
          >
            <Link href="/tools/script-to-scene" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-6xl mb-4" role="img" aria-label="scene">🎬</span>
              <h3 className="text-2xl font-orbitron text-jay-orange mb-2">Script-to-Scene</h3>
              <p className="text-jay-gray-light font-poppins">Generate visuals from your scene descriptions.</p>
            </Link>
          </motion.div>

       </motion.div>
      </main>
    </motion.div>
  );
};

export default DashboardPage;