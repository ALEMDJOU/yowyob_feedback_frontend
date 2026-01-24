/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*', // Ton serveur Java
      },
    ];
  },
  // Correction ici : "images" et non "mages"
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rwjlcxbvpoozggzkjfmi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;