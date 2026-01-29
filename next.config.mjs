/** @type {import('next').NextConfig} */
import './src/env.mjs';

const nextConfig = {
  swcMinify: false,
  experimental: {
    turbo: false,
  },
  // distDir: './dist', // Changes the build output directory to `./dist/`.
}

export default nextConfig