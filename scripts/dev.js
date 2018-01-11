const webpack = require('webpack')
const config = require('../webpack.dev.js')
const path = require('path')
const fs = require('fs')

const PREVIEW_DIR = path.join(__dirname, '../preview')

const dev = () => {
  if (!fs.existsSync(PREVIEW_DIR)){
    fs.mkdirSync(PREVIEW_DIR)
  }

  webpack(config, (err, stats) => {
    process.stdout.write(stats.toString() + "\n")
  })
}


if (require.main === module) {
  dev()
}

module.exports = dev
