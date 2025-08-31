import Head from 'next/head';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import CyberLoader from '@/components/CyberLoader';
import { supabase } from '@/lib/supabase'; 
import AnimatedButton from '@/components/AnimatedButton'; 
import { useNotification } from '@/context/NotificationContext';



interface MemeTemplate {
  id: string;
  name: string;
  imageSrc: string; 
  defaultTopText?: string;
  defaultBottomText?: string;
}

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'distracted_boyfriend',
    name: 'Distracted Boyfriend',
    imageSrc: '/memes/distracted-boyfriend.jpg',
    defaultTopText: 'My project idea',
    defaultBottomText: 'My focus'
  },
  {
    id: 'drake_hotline_bling',
    name: 'Drake Hotline Bling',
    imageSrc: '/memes/drake-meme.jpg',
    defaultTopText: 'Complex Solution',
    defaultBottomText: 'Simple Solution'
  },
  {
    id: 'expanding_brain',
    name: 'Expanding Brain',
    imageSrc: '/memes/expanding-brain.jpg',
    defaultTopText: 'Basic idea',
  },
  {
    id: 'woman_yelling_cat',
    name: 'Woman Yelling At Cat',
    imageSrc: '/memes/woman-yelling-at-cat.jpg',
    defaultTopText: 'Me trying to work',
    defaultBottomText: 'My notifications'
  },
];

const MemeMakerPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null); 
  const { showNotification } = useNotification(); 


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


  const wrapText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
    ): number => {
      const words = text.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const startY = y;
      for (let i = 0; i < lines.length; i++) {
        const currentY = startY + i * lineHeight;
        ctx.strokeText(lines[i].trim(), x, currentY);
        ctx.fillText(lines[i].trim(), x, currentY);
      }
      return lines.length * lineHeight;
    },
    []
  );

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);
    setError(null);

    const img = new (window as any).Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplate.imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = fontSize / 16 > 2 ? fontSize / 16 : 2;

      const paddingPercent = 0.05;
      const textPadding = canvas.height * paddingPercent;
      const lineHeight = fontSize * 1.1;
      const maxWidth = canvas.width * 0.9;

      ctx.textBaseline = 'top';
      wrapText(ctx, topText.toUpperCase(), canvas.width / 2, textPadding, maxWidth, lineHeight);


      ctx.textBaseline = 'bottom';
      wrapText(ctx, bottomText.toUpperCase(), canvas.width / 2, canvas.height - textPadding, maxWidth, lineHeight);
      
      setIsProcessing(false);
    };

    img.onerror = () => {
      setError('Failed to load meme template image.');
      setIsProcessing(false);
    };
  }, [selectedTemplate, topText, bottomText, fontSize, fontColor, strokeColor, wrapText]);


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        drawMeme();
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [drawMeme]);


  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTopText(template.defaultTopText || '');
    setBottomText(template.defaultBottomText || '');
    setError(null);
    setSaveSuccess(null); 
  };


  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `jayverse-meme-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccess('Meme downloaded!'); // Optionally show success for download
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const saveMemeToGallery = async () => {
    if (!user || !selectedTemplate || isProcessing) {
      showNotification("Please log in, select a template, and ensure meme is processed.", 'info'); 
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Meme not ready for saving.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    setError(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');

      const response = await fetch(dataUrl);
      const blob = await response.blob();

  
      const fileName = `meme_${user.id}_${Date.now()}.png`;
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
          title: `Meme: ${topText.substring(0, 30)}${topText.length > 30 ? '...' : ''} - ${selectedTemplate.name}`,
          image_url: publicUrl,
          tool_source: 'Meme Maker',
        });

      if (dbError) {
        throw dbError;
      }

     setSaveSuccess('Meme saved to your gallery!');
      showNotification('Meme saved to your gallery!', 'success');

      setCopyLinkSuccess(publicUrl);
    } catch (err: any) {

      showNotification(`Failed to save meme: ${err.message || err.error_description || 'Unknown error'}`, 'error'); // 🌟 Show error notification 🌟
      setError(err.message || 'Unknown error');
    } finally {
      setIsSaving(false);
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
        <title>Meme Starter Kit - Jayverse Tools</title>
        <meta name="description" content="Create hilarious memes instantly." />
      </Head>

      <div className="w-full max-w-6xl bg-jay-black/50 p-8 rounded-2xl shadow-lg border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h1 className="text-4xl font-orbitron text-jay-orange text-center mb-8 holographic-text">Meme Starter Kit</h1>
        <p className="text-center text-jay-gray-light font-poppins mb-8">
          Choose a template, add your text, and download your viral masterpiece!
        </p>
        {/* Template Selection */}
        <h2 className="text-3xl font-orbitron text-jay-white mb-6 text-center holographic-text">1. Choose Your Template</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {MEME_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedTemplate?.id === template.id ? 'border-jay-orange shadow-neon-outline' : 'border-jay-gray-dark hover:border-jay-orange hover:border-opacity-70'
              } transition-all duration-200`}
              onClick={() => handleTemplateSelect(template)}
            >
              <Image
                src={template.imageSrc}
                alt={template.name}
                width={200}
                height={200}
                objectFit="cover"
                className="w-full h-32 sm:h-40 object-cover"
              />
              <div className="p-2 bg-jay-gray-dark bg-opacity-70 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                <p className="text-sm font-poppins text-jay-white text-center truncate">{template.name}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedTemplate && (
          <>
            <h2 className="text-3xl font-orbitron text-jay-white mb-6 text-center holographic-text">2. Add Your Text</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col space-y-4">
                <div>
                  <label htmlFor="topText" className="block text-jay-white text-lg font-poppins mb-2">Top Text:</label>
                  <input
                    type="text"
                    id="topText"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    placeholder="Enter top meme text"
                  />
                </div>
                <div>
                  <label htmlFor="bottomText" className="block text-jay-white text-lg font-poppins mb-2">Bottom Text:</label>
                  <input
                    type="text"
                    id="bottomText"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full p-3 rounded-md bg-jay-black border border-jay-orange text-jay-white focus:ring-2 focus:ring-jay-orange outline-none font-poppins"
                    placeholder="Enter bottom meme text"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <div>
                  <label htmlFor="fontSize" className="block text-jay-white text-lg font-poppins mb-2">Font Size:</label>
                  <input
                    type="range"
                    id="fontSize"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-jay-orange"
                  />
                  <span className="text-sm text-jay-gray-light">{fontSize}px</span>
                </div>
                <div>
                  <label htmlFor="fontColor" className="block text-jay-white text-lg font-poppins mb-2">Font Color:</label>
                  <input
                    type="color"
                    id="fontColor"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-full h-10 rounded-md border border-jay-orange cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="strokeColor" className="block text-jay-white text-lg font-poppins mb-2">Stroke Color (Outline):</label>
                  <input
                    type="color"
                    id="strokeColor"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-10 rounded-md border border-jay-orange cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-orbitron text-jay-white mb-6 text-center holographic-text">3. Live Preview</h2>
            <div className="flex justify-center items-center bg-jay-black p-4 rounded-lg border border-jay-orange border-opacity-70 mb-8 overflow-hidden max-w-full">
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
                        {"Processing Meme...".split("").map((char, i) => (
                        <motion.span key={i} variants={{ animate: { opacity: [0.2, 1, 0.2], y: [0, -5, 0] } }} custom={i} className="inline-block">
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                        ))}
                    </motion.span>
                    </p>
                </div>
                )}
              <canvas ref={canvasRef} className="max-w-full h-auto block"></canvas>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full"> {/* Button group */}
                <AnimatedButton
                    onClick={downloadMeme}
                    disabled={isProcessing || !selectedTemplate}
                    className="flex-1"
                >
                    Download Your Meme
                </AnimatedButton>
                <AnimatedButton
                    onClick={saveMemeToGallery}
                    disabled={isProcessing || isSaving || !selectedTemplate || !user}
                    variant="secondary" 
                    className="flex-1"
                >
                    {isSaving ? 'Saving...' : 'Save to Gallery'}
                </AnimatedButton>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MemeMakerPage;

function setCopyLinkSuccess(publicUrl: string) {
  throw new Error('Function not implemented.');
}
