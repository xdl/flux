const path = require('path');

const config = {
  entry: './src/flux.js',
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: 'flux.js',
    library: 'flux'
  },
  module: {
    rules: [{
      test: /\.js$/,
      //I think this is the reason node_modules is excluded: it's the distributor's responsibility to transpile the dist version: https://github.com/cloverfield-tools/universal-react-boilerplate/issues/41
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env'],
          plugins: ['babel-plugin-transform-runtime']
        }
      }
    }]
  }
};

module.exports = config;
