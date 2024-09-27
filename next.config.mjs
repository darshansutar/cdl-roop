/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fal.ai'],
  },
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '100mb'
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
