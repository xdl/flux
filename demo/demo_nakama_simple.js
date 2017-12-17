const Flux = require('../src/flux.js')

window.init = () => {
  Flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library, flux) => {
    const apps = library.apps()
    const welcome = library.welcome()
    stage.addChild(apps)
    apps.play_button.buttonMode = true
    apps.play_button.addEventListener('click', () => {
      console.log("play got clicked");
      stage.removeChild(apps)
      stage.addChild(welcome)
    })
  })
}
