/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment
  output: 'export',

  reactStrictMode: true,

  // Optimize images for static export
  images: {
    unoptimized: true, // Required for static export
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },

  experimental: {
    // Enable optimized imports for large libs
    optimizePackageImports: ["@xenova/transformers", "onnxruntime-web"],
  },

  webpack: (config) => {
    // Prevent bundling native Node bindings in the browser
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'onnxruntime-node': false,
    };

    // Disable polyfills for Node core modules
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    return config;
  },
};

export default nextConfig;




