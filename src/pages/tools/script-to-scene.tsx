import Head from 'next/head';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedInput from '@/components/AnimatedInput';
import { supabase } from '@/lib/supabase';
import { useNotification } from '@/context/NotificationContext';


const ScriptToScenePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [scriptDescription, setScriptDescription] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (saveSuccess) {
        const timer = setTimeout(() => setSaveSuccess(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">

        <CyberLoader message={
          authLoading
            ? "Authenticating Jayverse..."
            : "Generating Scene... This might take a moment. Thank you for your patience!"
        } />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleGenerateScene = async () => {
    if (!scriptDescription.trim()) {
      showNotification('Please enter a script or scene description.', 'info');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setSaveSuccess(null);
    setCopyLinkSuccess(null);

    try {
      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate scene image.');
      }

      setGeneratedImageUrl(data.imageUrl);
      showNotification('Scene generated!', 'success');
    } catch (err: any) {
      console.error('Error generating scene:', err);
      showNotification(`Scene generation failed: ${err.message || 'Unknown error'}`, 'error');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const saveSceneToGallery = async () => {
    if (!user || !generatedImageUrl || isSaving) {
      showNotification("Please log in and generate an image first.", 'info');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setError(null);
    setCopyLinkSuccess(null);

    try {
      let blob: Blob;
      if (generatedImageUrl.startsWith('data:')) {
        const response = await fetch(generatedImageUrl);
        blob = await response.blob();
      } else {
        showNotification("Fetching image from external URL for saving...", 'info');
        const response = await fetch(generatedImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from ${generatedImageUrl}`);
        }
        blob = await response.blob();
      }
      
      const contentType = blob.type || 'image/png';

      const fileName = `scene_${user.id}_${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jayverse-gallery')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType,
        });

      if (uploadError) {
        throw uploadError;
      }

      const publicUrl = supabase.storage
        .from('jayverse-gallery')
        .getPublicUrl(filePath).data?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not get public URL for uploaded image.");
      }

      const { error: dbError } = await supabase
        .from('user_gallery')
        .insert({
          user_id: user.id,
          title: `Scene: ${scriptDescription.substring(0, 50)}${scriptDescription.length > 50 ? '...' : ''}`,
          image_url: publicUrl,
          tool_source: 'Script-to-Scene',
        });

      if (dbError) {
        throw dbError;
      }

      setSaveSuccess('Scene saved to your gallery!');
      showNotification('Scene saved to your gallery!', 'success');
      setCopyLinkSuccess(publicUrl);
    } catch (err: any) {
      console.error('Error saving scene:', err);
      showNotification(`Failed to save scene: ${err.message || 'Unknown error'}`, 'error');
      setError(`Failed to save scene: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyPublicUrl = () => {
    if (copyLinkSuccess) {
      navigator.clipboard.writeText(copyLinkSuccess);
      showNotification('Public link copied!', 'success');
      setSaveSuccess('Public link copied!');
      setTimeout(() => setSaveSuccess(null), 3000);
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
        <title>Script-to-Scene - Jayverse Tools</title>
        <meta name="description" content="Generate visual scenes from text descriptions using AI." />
      </Head>

      <div className="w-full max-w-4xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Script-to-Scene</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Turn your written scene descriptions into stunning visuals with AI.
        </p>

        <div className="mb-8 p-6 bg-jay-black rounded-lg border border-jay-gray-dark space-y-4">
          <label htmlFor="scriptDescription" className="block text-jay-white text-lg font-poppins mb-2">
            Enter your scene description:
          </label>
          <AnimatedInput
            as="textarea"
            id="scriptDescription"
            value={scriptDescription}
            onChange={(e) => setScriptDescription(e.target.value)}
            textareaProps={{ rows: 6 }}
            placeholder="e.g., A cyberpunk city at night, neon lights reflecting on wet streets, a lone figure walking under a holographic billboard advertising a new VR game."
            disabled={loading}
          />
          <AnimatedButton
            onClick={handleGenerateScene}
            disabled={loading || !scriptDescription.trim()}
            className="w-full"
          >
            {loading ? 'Generating Scene...' : 'Generate Scene'}
          </AnimatedButton>
        </div>

        {generatedImageUrl && (
          <div className="mt-8 p-6 bg-jay-black rounded-lg border border-jay-orange border-opacity-70 text-center">
            <h2 className="text-2xl font-orbitron text-jay-orange mb-4 holographic-text">Generated Scene:</h2>
            <div className="relative w-full h-96 bg-jay-gray-dark rounded-md overflow-hidden flex items-center justify-center">
              <Image
                src={generatedImageUrl}
                alt="Generated Scene"
                layout="fill"
                objectFit="contain"
                className="rounded-md"
                unoptimized
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                <a
                href={generatedImageUrl}
                download={`jayverse-scene-${Date.now()}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-block py-3 px-8 font-bold rounded-2xl transition-all duration-300 transform bg-jay-orange text-jay-black hover:bg-opacity-90 hover:scale-105 shadow-neon text-center"
                >
                Download Scene Image
                </a>
                <AnimatedButton
                    onClick={saveSceneToGallery}
                    disabled={isSaving || !generatedImageUrl || !user}
                    variant="secondary"
                    className="flex-1"
                >
                    {isSaving ? 'Saving...' : 'Save to Gallery'}
                </AnimatedButton>
            </div>
            {copyLinkSuccess && (
                <div className="mt-4 w-full">
                    <AnimatedButton
                        onClick={copyPublicUrl}
                        className="w-full"
                        variant="secondary"
                    >
                        Copy Public Link
                    </AnimatedButton>
                </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScriptToScenePage;