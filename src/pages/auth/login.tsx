import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/AnimatedButton';
import AnimatedInput from '@/components/AnimatedInput';
import AnimatedDivider from '@/components/AnimatedDivider'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingLogin(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingLogin(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jay-black text-jay-orange">
        <p className="text-2xl font-orbitron animate-pulse">Loading Jayverse...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex items-center justify-center px-4 py-8 flex-grow"
    >
      <Head>
        <title>Login to Jayverse Tools</title>
      </Head>

      <div className="bg-jay-black/50 p-8 rounded-2xl shadow-lg w-full max-w-md border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h2 className="text-4xl font-orbitron text-jay-orange text-center mb-6">Login to Jayverse</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-jay-white text-lg font-poppins mb-2">Email</label>
            <AnimatedInput
              type="email"
              id="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loadingLogin}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-jay-white text-lg font-poppins mb-2">Password</label>
            <AnimatedInput
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loadingLogin}
            />
          </div>
          <AnimatedButton
            type="submit"
            disabled={loadingLogin}
            className="w-full"
          >
            {loadingLogin ? 'Logging In...' : 'Login'}
          </AnimatedButton>
        </form>

        <AnimatedDivider className="my-8" />
        <p className="text-center text-jay-white font-poppins my-4">OR</p>

        <AnimatedButton
          onClick={handleGoogleLogin}
          variant="secondary"
          disabled={loadingLogin}
          className="w-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700"
        >
          <img src="/icons/google.svg" alt="Google icon" className="w-6 h-6 mr-3" />
          {loadingLogin ? 'Signing In...' : 'Sign in with Google'}
        </AnimatedButton>

        <p className="mt-6 text-center text-jay-gray-light font-poppins">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-jay-orange hover:underline font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;