const INKSCAPE_TITLE_TAG = 'title'
//Node, {x, y, width, height, bottom, top, left, right}
const DisplayObject = (dom_node, dom_rect, container_width, container_height) => {
  //zero the node:
  //dom_node.setAttribute('transform', `translate(${-dom_rect.x}, ${-dom_rect.y})`)
  //dom_node.setAttribute('transform', `translate(${-dom_rect.x}, 0)`)
  dom_node.setAttribute('transform', `translate(${-dom_rect.x + 207}, 0)`)
  console.log("-dom_rect.x + 207: ", -dom_rect.x + 207);
  return {
    node: dom_node,
    dom_rect
  }
}
const Library = (inkscape_container) => {
  const directory = {}
  //needs to be in pixels for now
  const width = inkscape_container.getAttribute('width')
  const height = inkscape_container.getAttribute('height')
  const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    directory[name] = () => {
      return DisplayObject(
        title.parentNode.cloneNode(),
        title.parentNode.getBoundingClientRect(),
        width,
        height
      )
    }
  }
  return directory
}

const createStage = (inkscape_container) => {
  const attributes = [
    ['viewBox', inkscape_container.getAttribute('viewBox')],
    ['width', inkscape_container.getAttribute('width')],
    ['height', inkscape_container.getAttribute('height')]
  ]
  const ns = "http://www.w3.org/2000/svg"
  const stage = document.createElementNS(ns, "svg")
  for (let attribute of attributes) {
    stage.setAttribute(...attribute)
  }
  return stage
}

const Stage = (dom, inkscape_container) => {
  const stage = createStage(inkscape_container)
  dom.appendChild(stage)
  const addChild = (element) => {
    stage.appendChild(element.node)
  }
  return {
    addChild
    //removeChild
  }
}

module.exports = {
  init: (stage_element, library_element, callback) => {
    const inkscape_container = library_element.contentDocument.firstElementChild
    const stage = Stage(stage_element, inkscape_container)
    const library = Library(inkscape_container)
    return callback(stage, library)
  }
}
