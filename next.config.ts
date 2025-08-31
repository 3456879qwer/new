/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  images: {
    domains: [
      'via.placeholder.com', // Add this line for your mock images
      // Add any other external image domains your app might use (e.g., cdn.example.com)
    ],
  },
};

export default nextConfig;