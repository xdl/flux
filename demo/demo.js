const flux = require('../src/flux.js')

window.init = () => {
  flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library) => {
    const square = library.Square()
    const circle = library.Circle()
    const triangle = library.Triangle()
    const triangle_grouped = library.TriangleGrouped()
    //const apps = library.apps()
    //stage.addChild(apps)
    stage.addChild(square)
    stage.addChild(triangle_grouped)
    //console.log("triangle_grouped.dom_rect: ", triangle_grouped.dom_rect);
    stage.addChild(triangle)
    //console.log("square.dom_rect: ", square.dom_rect);
    //console.log("square.getCoords(): ", square.getCoords());
  })
}
