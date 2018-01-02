const path = require('path')
const fs = require('fs')
const http = require('http')
const copySync = require('./lib/lib.js').copySync

const PREVIEW_DIR = path.join(__dirname, '../preview')
const BIN_DIR = path.join(__dirname, '../bin')


//https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
const hashToPort = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash
  }
  return 5000 + hash % 5000
}

const preview = () => {
  if (!fs.existsSync(PREVIEW_DIR)){
    fs.mkdirSync(PREVIEW_DIR)
  }

  copySync(
    path.join(BIN_DIR, 'flux.js'),
    path.join(PREVIEW_DIR, 'flux.js'))

  const PREVIEW_PORT = hashToPort('flux-preview')
  console.log(`HTTP server serving off ${PREVIEW_DIR} at ${PREVIEW_PORT}`);

  const static_server = http.createServer((req, res) => {
    fs.readFile(path.join(PREVIEW_DIR, req.url), (err, data) => {
      if (err) {
        console.log(`${req.url} not found`)
        res.writeHead(404)
        return res.end('')
      } else {
        res.writeHead(200);
        return res.end(data)
      }
    })
  })
  static_server.listen(PREVIEW_PORT)
}

if (require.main === module) {
  preview()
}

module.exports = preview
