const Flux = require('../src/flux2.js')
const ASSET_PATH = 'assets/nakama_mockup_171217.svg'

const setupHtml = () => {
  //CSS
  const style = document.createElement('style')
  style.type = 'text/css'
  const flux_css = `
      #stage {
        width: 800px;
        height: 400px;
        border: 1px black solid;
      }
      #assets {
        border: 1px black solid;
      }
      #fadeyElement {
        background-color: blue;
        opacity: 0;
      }`
  style.innerHTML = flux_css
  document.getElementsByTagName('head')[0].appendChild(style)
  //HTML
  const stage = document.createElement('div')
  stage.id = 'stage'
  document.getElementsByTagName('body')[0].prepend(stage)

  const fadeyElement = document.createElement('div')
  fadeyElement.id = 'fadeyElement'
  fadeyElement.innerHTML = 'Yo'
  document.getElementsByTagName('body')[0].prepend(fadeyElement)

  const assets = document.createElement('object')
  assets.id = 'assets'
  const asset_path = ASSET_PATH
  assets.setAttribute('type', 'image/svg+xml')
  assets.setAttribute('data', asset_path)
  document.getElementsByTagName('body')[0].appendChild(assets)
  assets.addEventListener('load', () => {
    initFlux()
  })
}

const initFlux = () => {
  Flux.init(document.getElementById('stage'), document.getElementById('assets'), (stage, library, flux) => {
    const welcome = library.page_home_welcome()
    const occupants = library.page_home_occupants()
    stage.addChild(welcome)
    welcome.join_room_btn.buttonMode = true
    welcome.join_room_btn.addEventListener('click', () => {
      stage.removeChild(welcome)
      stage.addChild(occupants)
    })
  })
}

window.init = () => {
  setupHtml()
}
