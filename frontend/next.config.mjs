/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "charitystride.test",
      },
    ],
    // For local development - bypass optimization for local storage
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
