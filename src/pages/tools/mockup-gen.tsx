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

interface MockupTemplate {
  id: string;
  name: string;
  imageSrc: string;
  logoX: number; 
  logoY: number; 
  logoWidth: number; 
  logoHeight: number; 
}

const MOCKUP_TEMPLATES: MockupTemplate[] = [
  {
    id: 'tshirt_front',
    name: 'T-Shirt (Front)',
    imageSrc: '/mockups/tshirt-mockup.png', 
    logoX: 1498, 
    logoY: 1057, 
    logoWidth: 1553, 
    logoHeight: 1337, 
  },
  {
    id: 'phone_screen',
    name: 'Phone Screen',
    imageSrc: '/mockups/phone-mockup.png', 
    logoX: 665,
    logoY: 441,
    logoWidth: 628,
    logoHeight: 628,
  },
  {
    id: 'poster_vertical',
    name: 'Poster (Vertical)',
    imageSrc: '/mockups/poster-mockup.png', 
    logoX: 160,
    logoY: 165,
    logoWidth: 131,
    logoHeight: 154,
  },
  {
    id: 'mug_side',
    name: 'Coffee Mug',
    imageSrc: '/mockups/mug-mockup.png', 
    logoX: 1065,
    logoY: 1079,
    logoWidth: 816,
    logoHeight: 908,
  },

];

const MockupGenPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplate | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(100);
  const [logoOpacity, setLogoOpacity] = useState(1.0);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');
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

 const MockupGenPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplate | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(100);
  const [logoOpacity, setLogoOpacity] = useState(1.0);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');
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

  const drawMockup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);
    setError(null);
    setCopyLinkSuccess(null);


    const mockupImg = new (window as any).Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = selectedTemplate.imageSrc;

    mockupImg.onload = () => {
      canvas.width = mockupImg.width;
      canvas.height = mockupImg.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);

      if (uploadedLogoUrl) {
        const logoImg = new (window as any).Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = uploadedLogoUrl;

        logoImg.onload = () => {
          const targetWidth = selectedTemplate.logoWidth * (logoScale / 100);
          const targetHeight = selectedTemplate.logoHeight * (logoScale / 100);

          const finalLogoWidth = Math.min(targetWidth, selectedTemplate.logoWidth);
          const finalLogoHeight = Math.min(targetHeight, selectedTemplate.logoHeight);

          const centerX = selectedTemplate.logoX + selectedTemplate.logoWidth / 2;
          const centerY = selectedTemplate.logoY + selectedTemplate.logoHeight / 2;

          const drawX = centerX - finalLogoWidth / 2;
          const drawY = centerY - finalLogoHeight / 2;

          ctx.globalAlpha = logoOpacity;
          ctx.globalCompositeOperation = blendMode;

          ctx.drawImage(logoImg, drawX, drawY, finalLogoWidth, finalLogoHeight);

          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = 'source-over';

          setIsProcessing(false);
        };

        logoImg.onerror = () => {
          setError('Failed to load uploaded logo. Ensure it\'s a valid image.');
          setIsProcessing(false);
        };
      } else {
        setIsProcessing(false);
      }
    };

    mockupImg.onerror = () => {
      setError('Failed to load mockup template image. Check path and file.');
      setIsProcessing(false);
    };
  }, [selectedTemplate, uploadedLogoUrl, logoScale, logoOpacity, blendMode]);


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      drawMockup();
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [drawMockup]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogoUrl(reader.result as string);
        setError(null);
        setSaveSuccess(null);
        setCopyLinkSuccess(null);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedLogoUrl(null);
      setError(null);
      setSaveSuccess(null);
      setCopyLinkSuccess(null);
    }
  };

  const downloadMockup = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `jayverse-mockup-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccess('Mockup downloaded!');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };


  const saveMockupToGallery = async () => {
    if (!user || !selectedTemplate || !uploadedLogoUrl || isProcessing) {
      setError("Please log in, select a template, upload a logo, and ensure mockup is processed.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Mockup not ready for saving.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setError(null);
    setCopyLinkSuccess(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName = `mockup_${user.id}_${Date.now()}.png`;
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
          title: `Mockup: ${selectedTemplate.name}`,
          image_url: publicUrl,
          tool_source: 'Mockup Genie',
        });

      if (dbError) {
        throw dbError;
      }

      setSaveSuccess('Mockup saved to your gallery!');
      setCopyLinkSuccess(publicUrl);
    } catch (err: any) {
      console.error('Error saving mockup:', err);
      setError(`Failed to save mockup: ${err.message || err.error_description || 'Unknown error'}`);
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
        <title>Mockup Genie - Jayverse Tools</title>
        <meta name="description" content="Preview your logos and designs on various mockups." />
      </Head>


      <OnboardingTooltip
        storageKey="mockup_gen_onboarded"
        title="Welcome to Mockup Genie!"
        message={
          <>
            <p>1. **Choose a mockup** from the templates below.</p>
            <p>2. **Upload your logo** (PNG with transparency works best).</p>
            <p>3. **Adjust its size and blend mode** to make it look realistic.</p>
            <p>Then, **download or save to your gallery!**</p>
          </>
        }
        delay={1500}
      />

      <div className="w-full max-w-5xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Mockup Genie</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Upload your logo, choose a mockup, and see your vision come to life!
        </p>

        {error && (
          <p className="text-red-500 text-center mt-4 font-poppins mb-4">{error}</p>
        )}
        {saveSuccess && (
          <p className="text-green-400 text-center mt-4 font-poppins">{saveSuccess}</p>
        )}

        {/* Mockup Template Selection */}
        <h2 className="text-3xl font-orbitron text-jay-white mb-6 text-center holographic-text">1. Choose Your Mockup</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {MOCKUP_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedTemplate?.id === template.id ? 'border-jay-orange shadow-neon-outline' : 'border-jay-gray-dark hover:border-jay-orange hover:border-opacity-70'
              } transition-all duration-200 group`} 
              onClick={() => setSelectedTemplate(template)}
            >
              <Image
                src={template.imageSrc}
                alt={template.name}
                width={200}
                height={200}
                objectFit="cover"
                className="w-full h-32 sm:h-40 object-cover group-hover-glitch" 
              />
              <div className="p-2 bg-jay-gray-dark bg-opacity-70 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                <p className="text-sm font-poppins text-jay-white text-center truncate">{template.name}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <>

            <h2 className="text-3xl font-orbitron text-jay-white mb-6 text-center holographic-text">2. Upload Your Logo</h2>
            <div className="mb-8 p-6 border-2 border-dashed border-jay-orange border-opacity-70 rounded-lg text-center cursor-pointer hover:bg-jay-gray-darker transition-colors duration-200">
              <input
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="block w-full cursor-pointer">
                {!uploadedLogoUrl ? (
                  <p className="text-jay-white font-poppins text-lg py-4">Click to upload your logo (PNG with transparency recommended)</p>
                ) : (
                  <div className="relative w-full h-40 flex justify-center items-center overflow-hidden">
                    <Image
                      src={uploadedLogoUrl}
                      alt="Uploaded Logo"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md group-hover-glitch" // 🌟 ADD group-hover-glitch 🌟
                    />
                  </div>
                )}
              </label>
            </div>

            {uploadedLogoUrl && (
              <>

                <div className="mb-8 p-6 bg-jay-black rounded-lg border border-jay-gray-dark space-y-4">
                  <h2 className="text-2xl font-orbitron text-jay-orange mb-4 text-center holographic-text">Adjust Logo</h2>
                  <div>
                    <label htmlFor="logoScale" className="block text-jay-white text-lg font-poppins mb-2">
                      Logo Size: <span className="text-jay-orange">{logoScale}%</span>
                    </label>
                    <input
                      type="range"
                      id="logoScale"
                      min="10"
                      max="200"
                      step="5"
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                    />
                  </div>
                  <div>
                    <label htmlFor="logoOpacity" className="block text-jay-white text-lg font-poppins mb-2">
                      Opacity: <span className="text-jay-orange">{(logoOpacity * 100).toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      id="logoOpacity"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                    />
                  </div>
                  <div>
                    <label htmlFor="blendMode" className="block text-jay-white text-lg font-poppins mb-2">
                      Blend Mode:
                    </label>
                    <select
                      id="blendMode"
                      value={blendMode}
                      onChange={(e) => setBlendMode(e.target.value as GlobalCompositeOperation)}
                      className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    >
                      <option value="source-over">Normal</option>
                      <option value="multiply">Multiply (Darken)</option>
                      <option value="screen">Screen (Lighten)</option>
                      <option value="overlay">Overlay (Combines Light/Dark)</option>
                      <option value="darken">Darken</option>
                      <option value="lighten">Lighten</option>
                      <option value="color-dodge">Color Dodge</option>
                      <option value="color-burn">Color Burn</option>
                      <option value="hard-light">Hard Light</option>
                      <option value="soft-light">Soft Light</option>
                      <option value="difference">Difference</option>
                      <option value="exclusion">Exclusion</option>
                      <option value="hue">Hue</option>
                      <option value="saturation">Saturation</option>
                      <option value="color">Color</option>
                      <option value="luminosity">Luminosity</option>
                    </select>
                  </div>
                </div>
              </>
            )}


            <h2 className="text-2xl font-orbitron text-jay-orange text-center mb-4 holographic-text">Live Mockup Preview:</h2>
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
                        {"Generating Mockup...".split("").map((char, i) => (
                        <motion.span key={i} variants={{ animate: { opacity: [0.2, 1, 0.2], y: [0, -5, 0] } }} custom={i} className="inline-block">
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                        ))}
                    </motion.span>
                  </p>
                </div>
              )}
              <canvas ref={canvasRef} className="max-w-full h-auto block rounded-md border border-jay-gray-dark"></canvas>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <AnimatedButton
                    onClick={downloadMockup}
                    disabled={isProcessing || !selectedTemplate || !uploadedLogoUrl}
                    className="flex-1"
                >
                    Download Mockup
                </AnimatedButton>
                <AnimatedButton
                    onClick={saveMockupToGallery}
                    disabled={isProcessing || isSaving || !selectedTemplate || !uploadedLogoUrl || !user}
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

export default MockupGenPage;