const path = require('path');

const config = {
  entry: './demo/demo.js',
  devtool: 'cheap-module-inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
};

module.exports = config;
