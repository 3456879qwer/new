import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const GuestExplorePage: React.FC = () => {
  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col items-center justify-center px-4 py-8 flex-grow text-jay-white"
    >
      <Head>
        <title>Jayverse Tools - Guest Access</title>
      </Head>

      <main className="flex flex-col items-center text-center w-full max-w-4xl"> 
        <h1 className="text-5xl md:text-6xl font-orbitron text-jay-orange holographic-text mb-4"> 
          Explore as Guest
        </h1>
        <p className="text-xl md:text-2xl font-poppins text-jay-white mb-8">
          Limited access to basic tools. Full power awaits!
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }} 
            whileTap={{ scale: 0.95 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon"
          >
            <Link href="/tools/caption-gen" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-5xl mb-3" role="img" aria-label="caption">✍️</span>
              <h3 className="text-xl font-orbitron text-jay-orange mb-2">AI Caption Master (Basic)</h3>
              <p className="text-jay-gray-light font-poppins text-sm">Generate basic captions.</p> 
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 165, 0, 0.7)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-jay-black/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-jay-orange border-opacity-50 shadow-inner-neon"
          >
            <Link href="/tools/meme-maker" className="flex flex-col items-center justify-center w-full h-full">
              <span className="text-5xl mb-3" role="img" aria-label="meme">😂</span>
              <h3 className="text-xl font-orbitron text-jay-orange mb-2">Meme Starter Kit (Basic)</h3>
              <p className="text-jay-gray-light font-poppins text-sm">Create basic memes.</p> {/* Added helper text */}
            </Link>
          </motion.div>
        </div>

        <p className="text-lg font-poppins text-jay-gray-light">
          Unlock all features and remove watermarks by{' '}
          <Link href="/auth/signup" className="text-jay-orange hover:underline font-bold">
            joining the Jayverse
          </Link>
          !
        </p>
      </main>
    </motion.div>
  );
};

export default GuestExplorePage;