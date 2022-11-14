/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 100,
  // webpack: (config, { isServer }) => {
  //   config.module.rules.push({
  //     test: /\.(glsl|vs|fs|vert|frag)$/,
  //     use: ['raw-loader', 'glslify-loader'],
  //   });
  //   config.resolve.fallback = {
  //     fs: false,
  //   };

  //   return config;
  // },
};

module.exports = nextConfig;
