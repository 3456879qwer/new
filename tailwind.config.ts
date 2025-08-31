import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',      // Pages Router files
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Reusable components
    // If you plan to add a 'modules' directory later (as per your plan) that contains
    // JSX/TSX files that use Tailwind classes, you'd add:
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'jay-black': '#000000',
        'jay-orange': '#FFA500',
        'jay-white': '#FFFFFF',
        'jay-gray-light': '#A0A0A0',
        'jay-gray-dark': '#333333',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;