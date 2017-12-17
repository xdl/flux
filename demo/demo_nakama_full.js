const Flux = require('../src/flux.js')

window.init = () => {
  Flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library, flux) => {
    const welcome = library.page_home_welcome()
    stage.addChild(welcome)
  })
}
