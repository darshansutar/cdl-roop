/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fal.ai'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase this value as needed
    }
  },
};

export default nextConfig;
