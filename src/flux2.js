const INKSCAPE_TITLE_TAG = 'title'
const SVGNS = "http://www.w3.org/2000/svg"

const DisplayObject = (elem) => {
  return {
    node: elem
  }
}

const createUseNode = (elem) => {
  //const node = document.createElementNS(SVGNS, 'use')
  //node.setAttributeNS(null, 'x', "0")
  //node.setAttributeNS(null, 'y', "0")
  //node.setAttributeNS(null, 'transform', "translate(-100, -50)")
  //node.setAttributeNS(null, 'height', "100%")
  //node.setAttributeNS(null, 'width', "100%")
  //node.setAttributeNS(null, 'xlink:href', `#${elem.id}`)
  const node = document.createElement('use')
  node.setAttribute('x', "0")
  node.setAttribute('y', "0")
  node.setAttribute('transform', "translate(-100, -50)")
  node.setAttribute('height', "100%")
  node.setAttribute('width', "100%")
  node.setAttribute('xlink:href', `#${elem.id}`)
  return node
}

const Library = (inkscape_container) => {
  const directory = {}
  const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      const use_node = createUseNode(elem)
      return DisplayObject(use_node)
    }
  }
  return directory
}

const createStageNode = (inkscape_container) => {
  const viewBox = inkscape_container.getAttribute('viewBox')
  const stageWidth = inkscape_container.getAttribute('width')
  const stageHeight = inkscape_container.getAttribute('height')
  const attributes = [
    ['viewBox', viewBox],
    ['width', stageWidth],
    ['height', stageHeight]
  ]
  const stage_node = document.createElementNS(SVGNS, "svg")
  for (let attribute of attributes) {
    stage_node.setAttribute(...attribute)
  }
  return stage_node
}

const fluxInit = (stage_element, inkscape_container) => {
  const stage_node = createStageNode(inkscape_container)

  //copy over layers to the stage element, then hide them
  for (let i = 0; i < inkscape_container.children.length; i++) {
    const child = inkscape_container.children[i]
    if (child.tagName === 'g') {
      const layer_clone = child.cloneNode(true)
      //layer_clone.style.display = 'none'
      stage_node.appendChild(layer_clone)
    }
  }

  stage_element.appendChild(stage_node)
  const library = Library(inkscape_container)
  const stage = {
    addChild: (display_object) => {
      stage_node.appendChild(display_object.node)
      //const test_string = `<use x="0" y="0" transform="translate(0, 0)" height="100%" width="100%" xlink:href="#g2467"/>`
      //cant see it here
      //const test_string = `<use x="0" y="0" height="100%" width="100%" xlink:href="#g2467"/>`
      stage_node.insertAdjacentHTML('beforeend', test_string)
    }
  }
  return {
    stage,
    library
  }
}

module.exports = {
  init: (stage_element, library_element, callback) => {
    const inkscape_container = library_element.contentDocument.firstElementChild
    const {
      stage,
      library
    } = fluxInit(stage_element, inkscape_container)
    return callback(stage, library)
  }
}
