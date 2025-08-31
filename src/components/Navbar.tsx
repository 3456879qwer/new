import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-jay-black bg-opacity-90 backdrop-blur-sm border-b border-jay-orange border-opacity-30 py-4 px-4 sm:px-6 lg:px-12 flex justify-between items-center shadow-lg"
    >

      <Link href="/" className="flex items-center space-x-1 sm:space-x-2" suppressHydrationWarning> 
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" 
        >
          <Image src="/images/logo.png" alt="Jayverse Logo" layout="fill" objectFit="contain" priority={true} />
        </motion.div>
        <motion.span
          className="text-xl sm:text-2xl md:text-3xl font-orbitron text-jay-orange mr-1 sm:mr-2 hidden sm:block" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Jayverse
        </motion.span>
      </Link>

      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6"> 

        <Link href="/dashboard" className="text-xs sm:text-sm text-jay-white hover:text-jay-orange font-poppins transition-colors duration-200 hidden md:inline-block" suppressHydrationWarning > {/* Hidden on mobile, show on md+ */}
          Dashboard
        </Link>
        <Link href="/trending-memes" className="text-xs sm:text-sm text-jay-white hover:text-jay-orange font-poppins transition-colors duration-200 " suppressHydrationWarning> {/* Hidden on mobile, show on md+ */}
          Trending
        </Link>
        <Link href="/dev-log" className="text-xs sm:text-sm text-jay-white hover:text-jay-orange font-poppins transition-colors duration-200 hidden md:inline-block" suppressHydrationWarning > {/* Hidden on mobile, show on md+ */}
          What's New?
        </Link>

        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-jay-orange text-jay-black font-bold rounded-xl text-xs sm:text-sm shadow-neon flex-shrink-0" /* Adjusted padding/font, added flex-shrink-0 */
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-shrink-0" 
          >
            <Link href="/auth/login" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-jay-orange text-jay-black font-bold rounded-xl text-xs sm:text-sm shadow-neon hover:bg-opacity-90 transition-all duration-300 flex-shrink-0" suppressHydrationWarning > {/* Adjusted padding/font, added flex-shrink-0 */}
              Login
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;