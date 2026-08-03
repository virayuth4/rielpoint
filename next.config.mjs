import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  allowedDevOrigins: [
    "192.168.18.6",
    "192.168.18.6:3000",
    "http://192.168.18.6:3000",
  ],

  async rewrites() {
    return [
      {
        source: "/__/auth/handler",
        destination: "/api/auth/handler",
      },
    ];
  },

  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "products-sale-bucket.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist(nextConfig);