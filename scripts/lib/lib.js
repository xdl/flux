const fs = require('fs')
//https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
const copySync = (src, dst) => {
  if (!fs.existsSync(src)) {
    return false;
  }
  const data = fs.readFileSync(src, 'utf-8');
  fs.writeFileSync(dst, data);
}

exports.copySync = copySync
