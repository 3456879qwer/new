import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext'; 
import MainLayout from '@/layouts/MainLayout';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
  }, []);

  return (
    <AuthProvider>

      <NotificationProvider>
        <AnimatePresence mode="wait" initial={false}>
          <MainLayout>
            <Component {...pageProps} key={router.asPath} />
          </MainLayout>
        </AnimatePresence>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp;