/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fal.ai'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb' // Increase this value as needed
    }
  },
  async headers() {
    return [
      {
        source: '/api/download-model',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
