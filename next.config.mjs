/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    turbo: false,
  },
  // distDir: './dist', // Changes the build output directory to `./dist/`.
}

export default nextConfig