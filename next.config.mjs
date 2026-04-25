/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable static export to fix ONNX Runtime build issue
  // output: 'export',

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

  // Disable minification to avoid Terser issue with ONNX Runtime files
  swcMinify: false,

  webpack: (config, { isServer }) => {
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

    // Disable minification for client builds
    if (!isServer) {
      config.optimization.minimize = false;
    }

    return config;
  },
};

export default nextConfig;




