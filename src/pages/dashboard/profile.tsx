import Head from 'next/head';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion'; 
import CyberLoader from '@/components/CyberLoader';
import { supabase } from '@/lib/supabase';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedInput from '@/components/AnimatedInput';
import { useNotification } from '@/context/NotificationContext';

interface Profile {
  id: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
}

interface UserStats {
  memesSaved: number;
  glitchesApplied: number;
  mockupsCreated: number;
  scenesGenerated: number;
  totalSaved: number;
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    const getProfile = async () => {
      if (!user) return; 

      setLoadingProfile(true);

      try {

        const { data: profileData, error: profileError, status } = await supabase
          .from('profiles')
          .select(`id, username, avatar_url`)
          .eq('id', user.id)
          .single();

        if (profileError && status !== 406) {
          throw profileError;
        }

        if (profileData) {
          setUsername(profileData.username || '');
          setAvatarUrl(profileData.avatar_url);
        } else {

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id, username: user.email?.split('@')[0] || 'New User' }); // Default username
          if (insertError) {
            console.error('Error creating initial profile:', insertError);
            showNotification('Failed to create initial profile.', 'error');
          } else {
            setUsername(user.email?.split('@')[0] || 'New User');
            showNotification('Welcome! Your profile has been created.', 'success');
          }
        }


        const { data: galleryData, error: galleryError } = await supabase
          .from('user_gallery')
          .select('tool_source');

        if (galleryError) {
          console.error('Error fetching gallery stats:', galleryError);

        } else {
          const fetchedStats: UserStats = {
            memesSaved: 0,
            glitchesApplied: 0,
            mockupsCreated: 0,
            scenesGenerated: 0,
            totalSaved: galleryData.length,
          };
          galleryData.forEach((item: { tool_source: string }) => {
            if (item.tool_source === 'Meme Maker') fetchedStats.memesSaved++;
            else if (item.tool_source === 'Glitch My Profile') fetchedStats.glitchesApplied++;
            else if (item.tool_source === 'Mockup Genie') fetchedStats.mockupsCreated++;
            else if (item.tool_source === 'Script-to-Scene') fetchedStats.scenesGenerated++;
          });
          setStats(fetchedStats);
        }

      } catch (err: any) {
        console.error('Error fetching/creating profile or stats:', err);
        showNotification(`Failed to load profile: ${err.message || 'Unknown error'}`, 'error');
      } finally {
        setLoadingProfile(false);
      }
    };

    getProfile();
  }, [user, showNotification]); 


  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      showNotification('You must be logged in to upload an avatar.', 'error');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    showNotification('Uploading avatar...', 'info', 0); 
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`; 
    const filePath = `${user.id}/${fileName}`; 

    try {

      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          const oldFilePathToDelete = `${user.id}/${oldFileName}`; 
          const { error: removeError } = await supabase.storage.from('avatars').remove([oldFilePathToDelete]);
          if (removeError) {
            console.warn('Could not delete old avatar (might not exist or permission issue):', removeError.message);
          }
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, 
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = publicUrlData?.publicUrl;


      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      showNotification('Avatar uploaded and updated!', 'success');
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      showNotification(`Avatar upload failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification('You must be logged in to update your profile.', 'error');
      return;
    }
    if (!username.trim()) {
      showNotification('Username cannot be empty.', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
      showNotification('Profile updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showNotification(`Profile update failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message={authLoading ? "Authenticating Jayverse..." : "Loading Profile..."} />
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
      className="relative z-20 flex flex-col items-center px-4 py-8 flex-grow text-jay-white"
    >
      <Head>
        <title>My Jayverse Profile</title>
        <meta name="description" content="Manage your Jayverse Tools profile and view your stats." />
      </Head>

      <div className="w-full max-w-2xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">My Jayverse Profile</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Personalize your Jayverse experience.
        </p>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-jay-gray-dark border-2 border-jay-orange mb-4 flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" layout="fill" objectFit="cover" className="rounded-full" unoptimized />
            ) : (
              <span className="text-6xl" role="img" aria-label="default avatar">👤</span>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <CyberLoader message="Uploading..." />
              </div>
            )}
          </div>

          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            disabled={uploadingAvatar}
          />
          <label htmlFor="avatar-upload" className="cursor-pointer text-jay-orange hover:underline text-sm font-poppins">
            {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
          </label>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50">
          <h2 className="text-2xl font-orbitron text-jay-white mb-4 text-center holographic-text">Profile Details</h2>
          <div>
            <label htmlFor="username" className="block text-jay-white text-lg font-poppins mb-2">Username:</label>
            <AnimatedInput
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={updatingProfile}
            />
          </div>
          <div>
            <label className="block text-jay-white text-lg font-poppins mb-2">Email:</label>
            <p className="p-3 rounded-md bg-jay-gray-dark text-jay-gray-light font-poppins select-all">
              {user.email}
            </p>
          </div>
          <AnimatedButton
            type="submit"
            disabled={updatingProfile}
            className="w-full"
          >
            {updatingProfile ? 'Updating Profile...' : 'Update Profile'}
          </AnimatedButton>
        </form>

        <div className="p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-50 text-center">
          <h2 className="text-2xl font-orbitron text-jay-orange mb-4 holographic-text">Your Jayverse Stats</h2>
          {stats ? (
            <div className="grid grid-cols-2 gap-4 font-poppins text-jay-white">
              <p className="text-left"><span className="text-jay-orange font-bold">{stats.totalSaved}</span> Total Creations Saved</p>
              <p className="text-left"><span className="text-jay-orange font-bold">{stats.memesSaved}</span> Memes Created</p>
              <p className="text-left"><span className="text-jay-orange font-bold">{stats.glitchesApplied}</span> Glitches Applied</p>
              <p className="text-left"><span className="text-jay-orange font-bold">{stats.mockupsCreated}</span> Mockups Generated</p>
              <p className="text-left"><span className="text-jay-orange font-bold">{stats.scenesGenerated}</span> Scenes Generated</p>
              <p className="text-left text-sm text-jay-gray-light">*(Coming Soon: Rates Submitted)*</p>
            </div>
          ) : (
            <p className="text-jay-gray-light font-poppins">Loading stats...</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;