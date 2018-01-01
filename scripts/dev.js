const webpack = require('webpack')
const config = require('../webpack.dev.js')
const path = require('path')
const fs = require('fs')
const express = require('express')

const BIN_DIR = path.join(__dirname, '../bin')

if (!fs.existsSync(BIN_DIR)){
  fs.mkdirSync(BIN_DIR)
}

//const compiler = webpack(config)
webpack(config, (err, stats) => {
  process.stdout.write(stats.toString() + "\n")
})
