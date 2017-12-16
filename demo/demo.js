const Flux = require('../src/flux.js')

window.init = () => {
  Flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library, flux) => {
    //const square = library.Square()
    //const circle = library.Circle()
    //const triangle = library.Triangle()
    //const triangle_grouped = library.TriangleGrouped()
    //const apps = library.apps()
    //stage.addChild(apps)

    //const simpletext = library.Simpletext()
    //stage.addChild(simpletext)
    //
    //stage.addChild(square)
    //stage.addChild(triangle_grouped)
    //console.log("triangle_grouped.dom_rect: ", triangle_grouped.dom_rect);
    //stage.addChild(triangle)
    //triangle.x = 1
    //triangle.y = 1
    //console.log("square.dom_rect: ", square.dom_rect);
    //console.log("square.getCoords(): ", square.getCoords());
    //
    
    //const group_with_clone = library.GroupWithClone()
    //stage.addChild(group_with_clone)
    //group_with_clone.x = 10
    //group_with_clone.buttonMode = true
    //group_with_clone.addEventListener('click', () => {
      //console.log("I have been clicked");
    //})
    //console.log("stage.enableHints: ", stage.enableHints);
    //
    //Okay let's do nakama mockup again.
    const apps = library.apps()
    const welcome = library.welcome()
    stage.addChild(apps)
    apps.play_button.buttonMode = true
    apps.play_button.addEventListener('click', () => {
      console.log("play got clicked");
      stage.removeChild(apps)
      stage.addChild(welcome)
    })
    //console.log("apps.play_button: ", apps.play_button);
    //console.log("apps.play_button.x: ", apps.play_button.x);
    //apps.play_button.x = 10;
    //apps.x = 10;
    //console.log("apps.width: ", apps.width);
    //console.log("apps.play_button.width: ", apps.play_button.width);
    //console.log("apps.x: ", apps.x);
  })
}
