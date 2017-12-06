const INKSCAPE_TITLE_TAG = 'title'
//Node, {x, y, width, height, bottom, top, left, right}
const DisplayObject = (node, rect) => {
  let _x = 0
  let _y = 0
  const _applyAttributes = () => {
    node.setAttribute('transform', `translate(${-rect.x + _x}, ${-rect.y + _y})`)
  }
  //init
  _applyAttributes()
  return {
    node, //for Library

    x: _x,
    get x() {
      return _x
    },
    set x(__x) {
      _x = __x
      _applyAttributes()
    },

    y: _y,
    get y() {
      return _y
    },
    set y(__y) {
      _y = __y
      _applyAttributes()
    }
  }
}

//Does a deep clone, then recursively resolves <use> tags
const deepClone = (elem, inkscape_container) => {
  const clone = elem.cloneNode(true)
  return clone
}

const Library = (inkscape_container) => {
  const directory = {}
  const ids = {}
  const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      return DisplayObject(
        deepClone(elem, inkscape_container),
        elem.getBBox()
      )
    }
  }
  return directory
}

const createStage = (inkscape_container) => {
  const viewBox = inkscape_container.getAttribute('viewBox')
  const stageWidth = inkscape_container.getAttribute('width')
  const stageHeight = inkscape_container.getAttribute('height')
  const attributes = [
    ['viewBox', viewBox],
    ['width', stageWidth],
    ['height', stageHeight]
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
  const removeChild = (element) => {
    stage.removeChild(element.node)
  }
  return {
    addChild,
    removeChild
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
