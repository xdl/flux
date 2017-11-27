const flux = require('../src/flux.js')

window.init = () => {
  flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library) => {
    const square = library.Square()
    const circle = library.Circle()
    stage.addChild(circle)
  })
}
