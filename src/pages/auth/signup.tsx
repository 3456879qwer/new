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

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingSignup(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user && !data.session) { // User created, but email confirmation needed
        setFormSuccess('Success! Please check your email to confirm your account.');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSignup(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoadingSignup(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSignup(false);
    }
  };


  const [formSuccess, setFormSuccess] = useState<string | null>(null);


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
        <title>Sign Up for Jayverse Tools</title>
      </Head>

      <div className="bg-jay-black/50 p-8 rounded-2xl shadow-lg w-full max-w-md border border-jay-orange border-opacity-50 shadow-inner-neon">
        <h2 className="text-4xl font-orbitron text-jay-orange text-center mb-6">Join Jayverse</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {formSuccess && <p className="text-green-400 text-center mb-4">{formSuccess}</p>} {/* Display success message */}


        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-jay-white text-lg font-poppins mb-2">Email</label>
            <AnimatedInput
              type="email"
              id="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loadingSignup}
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
              disabled={loadingSignup}
            />
          </div>
          <AnimatedButton
            type="submit"
            disabled={loadingSignup}
            className="w-full"
          >
            {loadingSignup ? 'Signing Up...' : 'Sign Up'}
          </AnimatedButton>
        </form>

        <AnimatedDivider className="my-8" />
        <p className="text-center text-jay-white font-poppins my-4">OR</p>

        <AnimatedButton
          onClick={handleGoogleSignUp}
          variant="secondary"
          disabled={loadingSignup}
          className="w-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700"
        >
          <img src="/icons/google.svg" alt="Google icon" className="w-6 h-6 mr-3" />
          {loadingSignup ? 'Signing Up...' : 'Sign up with Google'}
        </AnimatedButton>

        <p className="mt-6 text-center text-jay-gray-light font-poppins">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-jay-orange hover:underline font-bold">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpPage;