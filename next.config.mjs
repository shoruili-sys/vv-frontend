/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'strapi' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'strapi.vivaverissimo.com.br' },
      { protocol: 'https', hostname: 'vivaverissimo.com.br' },
    ],
  },
  async rewrites() {
    const strapiUrl = process.env.STRAPI_URL || 'http://strapi:1337';
    return [
      { source: '/uploads/:path*', destination: `${strapiUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
