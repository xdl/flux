const webpack = require('webpack')
const config = require('../webpack.dev.js')
const path = require('path')
const fs = require('fs')

const BIN_DIR = path.join(__dirname, '../bin')

const dev = () => {
  if (!fs.existsSync(BIN_DIR)){
    fs.mkdirSync(BIN_DIR)
  }

  webpack(config, (err, stats) => {
    process.stdout.write(stats.toString() + "\n")
  })
}


if (require.main === module) {
  dev()
}

module.exports = dev
