import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  className?: string;
}

const socialLinks = [
  { name: 'TikTok', icon: '/icons/social/tiktok.svg', href: 'http://tiktok.com/@jay_techspot' },
  { name: 'Telegram', icon: '/icons/social/telegram.svg', href: 'https://t.me/mluhyamzii' },
  { name: 'Whatsapp', icon: '/icons/social/whatsapp.svg', href: 'https://wa.link/kdp1gz' },
  { name: 'Facebook', icon: '/icons/social/facebook.svg', href: 'https://web.facebook.com/people/Jay-Tech-Malinya/61576832994095/#' },

];

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }} 
      className={`relative z-20 w-full bg-jay-black bg-opacity-90 backdrop-blur-sm border-t border-jay-orange border-opacity-30 py-8 px-6 flex flex-col sm:flex-row justify-between items-center text-jay-gray-light text-sm font-poppins ${className}`}
    >

      <div className="mb-4 sm:mb-0 text-center sm:text-left">
        <p>&copy; {currentYear} Jayverse Tools. All rights reserved.</p>
        <Link href="/dev-log" className="text-jay-orange hover:underline text-xs mt-1 block">
          What's New?
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        {socialLinks.map((link) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-jay-gray-dark hover:bg-jay-orange transition-all duration-200 group"
            whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)" }}
            whileTap={{ scale: 0.9 }}
          >
            <Image
              src={link.icon}
              alt={link.name}
              width={20}
              height={20}
              className="filter grayscale group-hover:filter-none transition-all duration-200" 
            />
          </motion.a>
        ))}
      </div>
    </motion.footer>
  );
};

export default Footer;