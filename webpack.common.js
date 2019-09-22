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
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  }
};

module.exports = config;
