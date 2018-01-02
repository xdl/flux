const path = require('path')
const fs = require('fs')
const readline = require('readline')
const copySync = require('./lib/lib.js').copySync

const generateTemplate = (title, rel_svg_filepath) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <script src="flux.js"></script>
    <script>
    window.init = function() {
      var inkscapeSvg = document.getElementById('inkscape-svg');
      inkscapeSvg.style.display = 'none';
      flux.init(document.getElementById('stage'), inkscapeSvg, function(stage, library) {
      });
    }
    </script>
  </head>
  <body>
    <div id='stage'></div>
    <object onload=init() id='inkscape-svg' type="image/svg+xml" data="${rel_svg_filepath}"></object>
  </body>
</html>`
}

const bootstrap = (source) => {
  if (!fs.existsSync(source)) {
    console.log(`${source} doesn't exist; check resource filepath and try again`)
    process.exit(1)
  }
  const {
    base,
    dir,
    name
  } = path.parse(source)
  console.log(`${base} found in ${dir}`)
  const dest_dir = path.join(__dirname, '../preview')
  const svg_filepath = path.join(dest_dir, base)
  const html_filepath = path.join(dest_dir, name + '.html')
  const svg_present = fs.existsSync(svg_filepath)
  const html_present = fs.existsSync(html_filepath)
  const base_html = name + '.html'

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  if (!svg_present && !html_present) {
    rl.question(`Copy into ${dest_dir} and create corresponding html file ${base_html}?\n[y] or n `, (answer) => {
      if (answer === 'y' || answer === '') {
        copySync(source, svg_filepath)
        console.log(`copied over ${base} to ${dest_dir}`)
        fs.writeFileSync(html_filepath, generateTemplate(name, base))
        console.log(`created ${base_html} in ${dest_dir}`)
      } else {
        console.log("exiting without doing anything");
      }
      rl.close()
    })
  } else if (svg_present && html_present) {
    rl.question(`${base_html} and ${base} already exist in ${dest_dir}; want to just update ${base} from ${dir}?\n[y] or n `, (answer) => {
      if (answer === 'y' || answer === '') {
        copySync(source, svg_filepath)
        console.log(`copied over ${base} to ${dest_dir}`)
      } else {
        console.log("exiting without doing anything")
      }
      rl.close()
    })
  } else {
    console.log("svg_present: ", svg_present);
    console.log("html_present: ", html_present);
  }
}

if (require.main === module) {
  try {
    const source = process.argv[2]
    bootstrap(path.resolve(source))
  } catch(e) {
    console.error(e)
    console.log('Usage: node bootstrap.js <inkscape_resource_filepath>')
  }

}

module.exports = bootstrap
