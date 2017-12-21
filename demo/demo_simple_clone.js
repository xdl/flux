const Flux = require('../src/flux2.js')
const ASSET_PATH = 'assets/simple_cloning.svg'

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
    const gwc = library.GroupWithClone()
    stage.addChild(gwc)
  })
}

window.init = () => {
  setupHtml()
}
