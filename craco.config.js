// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        // Add other polyfills if needed
      };
      return webpackConfig;
    },
  },
};
