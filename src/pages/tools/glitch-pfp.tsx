import Head from 'next/head';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import { supabase } from '@/lib/supabase';
import AnimatedButton from '@/components/AnimatedButton';
import OnboardingTooltip from '@/components/OnboardingTooltip';

const GlitchPFPPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0.05);
  const [rgbShiftIntensity, setRgbShiftIntensity] = useState(5);
  const [scanlineIntensity, setScanlineIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<string | null>(null);



  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <CyberLoader message="Authenticating Jayverse..." />
      </div>
    );
  }


  if (!user) {
    return null;
  }


  const applyGlitchEffect = useCallback(() => {
    const inputCanvas = inputCanvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    if (!inputCanvas || !outputCanvas || !selectedImageFile || !imagePreviewUrl) {
      return;
    }

    const inputCtx = inputCanvas.getContext('2d', { willReadFrequently: true });
    const outputCtx = outputCanvas.getContext('2d');
    if (!inputCtx || !outputCtx) {
      setError('Could not get canvas context.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCopyLinkSuccess(null);


    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    img.src = imagePreviewUrl;

    img.onload = () => {
      inputCanvas.width = img.width;
      inputCanvas.height = img.height;
      outputCanvas.width = img.width;
      outputCanvas.height = img.height;

      inputCtx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
      inputCtx.drawImage(img, 0, 0, inputCanvas.width, inputCanvas.height);

      const imageData = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
      const data = imageData.data;

      const glitchedData = new Uint8ClampedArray(data);


      if (scanlineIntensity > 0) {
        for (let y = 0; y < outputCanvas.height; y++) {
          if (y % 2 === 0) {
            for (let x = 0; x < outputCanvas.width; x++) {
              const i = (y * outputCanvas.width + x) * 4;
              glitchedData[i] = glitchedData[i] * (1 - scanlineIntensity) + 0 * scanlineIntensity;
              glitchedData[i + 1] = glitchedData[i + 1] * (1 - scanlineIntensity) + 0 * scanlineIntensity;
              glitchedData[i + 2] = glitchedData[i + 2] * (1 - scanlineIntensity) + 0 * scanlineIntensity;
            }
          }
        }
      }


      if (rgbShiftIntensity > 0) {
        const offset = Math.round(rgbShiftIntensity);
        for (let i = 0; i < glitchedData.length; i += 4) {
          glitchedData[i] = data[i + offset * 4] || data[i];
          glitchedData[i + 1] = data[i + offset * 4 + 1] || data[i + 1];
          glitchedData[i + 2] = data[i - offset * 4 + 2] || data[i + 2];
        }
      }


      if (glitchIntensity > 0) {
        const pixelSize = Math.max(1, Math.round(glitchIntensity * 200));
        const maxOffset = Math.round(glitchIntensity * 50);

        for (let y = 0; y < outputCanvas.height; y += pixelSize) {
          if (Math.random() < glitchIntensity * 5) {
            const offset = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
            const sourceY = y;
            const targetY = y + Math.floor(Math.random() * glitchIntensity * 10);

            inputCtx.putImageData(
              inputCtx.getImageData(0, sourceY, inputCanvas.width, pixelSize),
              offset,
              targetY
            );
          }
        }
      }

      outputCtx.putImageData(imageData, 0, 0);
      outputCtx.putImageData(new ImageData(glitchedData, outputCanvas.width, outputCanvas.height), 0, 0);
      
      setIsProcessing(false);
    };

    img.onerror = () => {
      setError('Failed to load image.');
      setIsProcessing(false);
    };

  }, [imagePreviewUrl, glitchIntensity, rgbShiftIntensity, scanlineIntensity, selectedImageFile]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      applyGlitchEffect();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [imagePreviewUrl, glitchIntensity, rgbShiftIntensity, scanlineIntensity, applyGlitchEffect]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        setError(null);
        setSaveSuccess(null);
        setCopyLinkSuccess(null);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setError(null);
      setSaveSuccess(null);
      setCopyLinkSuccess(null);
    }
  };

  const downloadGlitchedImage = () => {
    const outputCanvas = outputCanvasRef.current;
    if (outputCanvas) {
      const dataURL = outputCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `jayverse-glitch-pfp-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccess('Glitched PFP downloaded!');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };


  const saveGlitchedImageToGallery = async () => {
    if (!user || !selectedImageFile || isProcessing) {
      setError("Please log in, upload an image, and ensure glitch effect is processed.");
      return;
    }

    const outputCanvas = outputCanvasRef.current;
    if (!outputCanvas) {
      setError("Glitched image not ready for saving.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setError(null);
    setCopyLinkSuccess(null);

    try {
      const dataUrl = outputCanvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName = `glitch_${user.id}_${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jayverse-gallery')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png',
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
          title: `Glitched PFP: ${selectedImageFile.name}`,
          image_url: publicUrl,
          tool_source: 'Glitch My Profile',
        });

      if (dbError) {
        throw dbError;
      }

      setSaveSuccess('Glitched PFP saved to your gallery!');
      setCopyLinkSuccess(publicUrl);
    } catch (err: any) {
      console.error('Error saving glitched PFP:', err);
      setError(`Failed to save PFP: ${err.message || err.error_description || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };


  const copyPublicUrl = () => {
    if (copyLinkSuccess) {
      navigator.clipboard.writeText(copyLinkSuccess);
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
        <title>Glitch My Profile - Jayverse Tools</title>
        <meta name="description" content="Apply glitch and cyberpunk filters to your profile pictures." />
      </Head>

      <div className="w-full max-w-4xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Glitch My Profile</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Upload your picture and transform it with cyber-inspired glitch effects!
        </p>

        {error && (
          <p className="text-red-500 text-center mt-4 font-poppins mb-4">{error}</p>
        )}
        {saveSuccess && (
          <p className="text-green-400 text-center mt-4 font-poppins">{saveSuccess}</p>
        )}

        {/* Image Upload */}
        <div className="mb-8 p-6 border-2 border-dashed border-jay-orange border-opacity-70 rounded-lg text-center cursor-pointer hover:bg-jay-gray-darker transition-colors duration-200">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="pfp-upload"
          />
          <label htmlFor="pfp-upload" className="block w-full cursor-pointer">
            {!imagePreviewUrl ? (
              <p className="text-jay-white font-poppins text-lg py-4">Click to upload your profile pic</p>
            ) : (
              <div className="relative w-full h-80 flex justify-center items-center overflow-hidden">
                <Image
                  src={imagePreviewUrl}
                  alt="Profile Picture Preview"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-md"
                />
              </div>
            )}
          </label>
        </div>

        {selectedImageFile && (
          <>
            {/* Glitch Controls */}
            <div className="mb-8 p-6 bg-jay-black rounded-lg border border-jay-gray-dark space-y-4">
              <h2 className="text-2xl font-orbitron text-jay-orange mb-4 text-center holographic-text">Adjust Glitch Effects</h2>

              <div>
                <label htmlFor="glitchIntensity" className="block text-jay-white text-lg font-poppins mb-2">
                  Pixel Glitch Intensity: <span className="text-jay-orange">{(glitchIntensity * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  id="glitchIntensity"
                  min="0"
                  max="0.1"
                  step="0.005"
                  value={glitchIntensity}
                  onChange={(e) => setGlitchIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                />
              </div>

              <div>
                <label htmlFor="rgbShiftIntensity" className="block text-jay-white text-lg font-poppins mb-2">
                  RGB Shift: <span className="text-jay-orange">{rgbShiftIntensity}px</span>
                </label>
                <input
                  type="range"
                  id="rgbShiftIntensity"
                  min="0"
                  max="20"
                  step="1"
                  value={rgbShiftIntensity}
                  onChange={(e) => setRgbShiftIntensity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                />
              </div>

              <div>
                <label htmlFor="scanlineIntensity" className="block text-jay-white text-lg font-poppins mb-2">
                  Scanlines (VHS Effect): <span className="text-jay-orange">{(scanlineIntensity * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  id="scanlineIntensity"
                  min="0"
                  max="1"
                  step="0.05"
                  value={scanlineIntensity}
                  onChange={(e) => setScanlineIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                />
              </div>
            </div>

            {/* Canvas Preview */}
            <h2 className="text-2xl font-orbitron text-jay-orange text-center mb-4 holographic-text">Glitched Preview:</h2>
            <div className="relative w-full flex justify-center items-center bg-jay-black p-4 rounded-lg border border-jay-orange border-opacity-70 mb-8 overflow-hidden">
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-jay-black bg-opacity-80 z-10">
                  <p className="text-xl font-orbitron text-jay-orange animate-pulse select-none">
                    <motion.span
                        variants={{
                        animate: {
                            opacity: [0.2, 1, 0.2],
                            y: [0, -5, 0],
                            transition: (i: number) => ({
                            delay: i * 0.1,
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                            })
                        }
                        }}
                        initial="animate"
                        animate="animate"
                        className="inline-block"
                    >
                        {"Processing Glitch...".split("").map((char, i) => (
                        <motion.span key={i} variants={{ animate: { opacity: [0.2, 1, 0.2], y: [0, -5, 0] } }} custom={i} className="inline-block">
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                        ))}
                    </motion.span>
                  </p>
                </div>
              )}
              <canvas ref={inputCanvasRef} className="hidden"></canvas>
              <canvas ref={outputCanvasRef} className="max-w-full h-auto block rounded-md border border-jay-gray-dark"></canvas>
            </div>

            {/* Download and Save Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <AnimatedButton
                    onClick={downloadGlitchedImage}
                    disabled={isProcessing || !imagePreviewUrl}
                    className="flex-1"
                >
                    Download Glitched PFP
                </AnimatedButton>
                <AnimatedButton
                    onClick={saveGlitchedImageToGallery}
                    disabled={isProcessing || isSaving || !imagePreviewUrl || !user}
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
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GlitchPFPPage;