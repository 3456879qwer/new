import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import { supabase } from '@/lib/supabase';
import AnimatedButton from '@/components/AnimatedButton';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';

interface GalleryItem {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  image_url: string;
  tool_source?: string;
}

const GalleryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification(); 

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    const fetchGalleryItems = async () => {
      if (!user) {
        setLoadingGallery(false);
        return;
      }

      setLoadingGallery(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_gallery')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching gallery items:', fetchError);
        setError(`Failed to load gallery: ${fetchError.message}`);
      } else {
        setGalleryItems(data as GalleryItem[]);
      }
      setLoadingGallery(false);
    };

    fetchGalleryItems();

    const subscription = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_gallery', filter: `user_id=eq.${user?.id}` }, payload => {
        console.log('Realtime gallery change received!', payload);
        fetchGalleryItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);


  if (authLoading || loadingGallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message={authLoading ? "Authenticating Jayverse..." : "Loading Gallery..."} />
      </div>
    );
  }


  if (!user) {
    return null;
  }

  const handleDeleteItem = async (itemId: string, imageUrl: string, sourceTool: string) => {
    if (!confirm('Are you sure you want to delete this item from your gallery?')) {
      return;
    }

    setError(null);
    setLoadingGallery(true);

    try {
      const bucketName = 'jayverse-gallery';
      const pathSegments = imageUrl.split(bucketName + '/')[1];

      if (!pathSegments) {
        throw new Error('Could not parse image URL for deletion.');
      }

      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([pathSegments]);

      if (storageError) {
        throw storageError;
      }

      const { error: dbError } = await supabase
        .from('user_gallery')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

       showNotification('Item deleted successfully!', 'success');
      setGalleryItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err: any) {
       showNotification(`Failed to delete item: ${err.message || err.error_description || 'Unknown error'}`, 'error');
      setError(err.message || 'Unknown error'); // Keep internal error state if needed
    } finally {
      setLoadingGallery(false);
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
        <title>My Jayverse Gallery - Jayverse Tools</title>
        <meta name="description" content="View your saved creations in Jayverse Tools." />
      </Head>

      <div className="w-full max-w-6xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">My Jayverse Gallery</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          All your amazing creations, saved right here in your personal Jayverse.
        </p>

        {error && (
          <p className="text-red-500 text-center mt-4 font-poppins">{error}</p>
        )}

        {galleryItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl font-poppins text-jay-gray-light mb-4">No creations saved yet!</p>
            <p className="font-poppins text-jay-gray-light">
              Head over to a tool like the{' '}
              <Link href="/tools/meme-maker" className="text-jay-orange hover:underline">Meme Starter Kit</Link>
              {' '}or{' '}
              <Link href="/tools/glitch-pfp" className="text-jay-orange hover:underline">Glitch My Profile</Link>
              {' '}to start creating and saving.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <motion.div
                key={item.id}
                className="relative bg-jay-black p-4 rounded-lg border border-jay-orange border-opacity-50 shadow-md flex flex-col group"
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)" }}
              >
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-md bg-jay-gray-dark flex items-center justify-center">
                  <Image
                    src={item.image_url}
                    alt={item.title || 'Gallery item'}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md group-hover-glitch" 
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-lg font-orbitron text-jay-orange mb-1 truncate" title={item.title}>{item.title}</h3>
                <p className="text-sm text-jay-gray-light font-poppins mb-2">
                  Tool: {item.tool_source || 'N/A'} | Saved: {new Date(item.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-auto">
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-jay-orange text-jay-black font-bold rounded-md text-sm hover:bg-opacity-90 transition-all duration-200 text-center"
                  >
                    View
                  </a>
                  <AnimatedButton
                    onClick={() => handleDeleteItem(item.id, item.image_url, item.tool_source || 'unknown')}
                    variant="danger"
                    className="flex-1 text-sm px-4 py-2"
                  >
                    Delete
                  </AnimatedButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GalleryPage;