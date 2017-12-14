const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config.js')

const DEV_PORT = 8080
const ASSETS_PORT = 8078

//webpack-dev-server
const dev_server = new WebpackDevServer(webpack(config), {
  contentBase: [
    //'dist/',
    'demo/' //use the index.html in demo/ for now
  ],
  proxy: {
    '/assets': `http://localhost:${ASSETS_PORT}` //static server
  }
});
dev_server.listen(DEV_PORT, "localhost", () => {})

const http = require('http')
const fs = require('fs')
const static_server = http.createServer((req, res) => {
  fs.readFile(__dirname + req.url, (err, data) => {
    if (err) {
      res.writeHead(404)
      return res.end('')
    } else {
      res.writeHead(200);
      return res.end(data)
    }
  })
})
static_server.listen(ASSETS_PORT)
