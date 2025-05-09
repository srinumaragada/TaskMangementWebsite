import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   eslint: {
    ignoreDuringBuilds: true, // ← This bypasses ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // ← Optional: Ignore TypeScript errors too
  }
};

export default nextConfig;
