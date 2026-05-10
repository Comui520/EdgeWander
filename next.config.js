/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "web.archive.org" },
      { protocol: "http", hostname: "web.archive.org" },
    ],
  },
};

module.exports = nextConfig;
