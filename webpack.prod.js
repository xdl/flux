const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const path = require('path')

module.exports = merge(common, {
  output: {
    path: path.resolve(__dirname, 'bin')
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
})
