/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Add http:// in front of the IP or wildcard port
  allowedDevOrigins: [
    '192.168.18.6',
    '192.168.18.6:3000',
    'http://192.168.18.6:3000',
  ],

  async rewrites() {
    return [
      {
        source: '/__/auth/handler',
        destination: '/api/auth/handler',
      },
    ];
  },

  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'products-sale-bucket.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;