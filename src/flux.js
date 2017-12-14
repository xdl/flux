const INKSCAPE_TITLE_TAG = 'title'
const SVGNS = "http://www.w3.org/2000/svg"

const DisplayObject = (dom_node, bbox) => {


  //initial values
  const children = []

  let x = 0
  let y = 0

  let buttonMode = false

  const applyStyling = () => {
    dom_node.style.cursor = buttonMode ? 'pointer' : 'default'
  }
  const applyTransformAttribute = () => {
    dom_node.setAttribute('transform', `translate(${-bbox.x + x}, ${-bbox.y + y})`)
  }

  //init; normalise to zero
  applyTransformAttribute()

  return {
    _node: dom_node,
    get x() {
      return x
    },
    set x(_x) {
      x = _x
      applyTransformAttribute()
    },
    get buttonMode() {
      return buttonMode
    },
    set buttonMode(_buttonMode) {
      buttonMode = _buttonMode
      applyStyling()
    },
    addEventListener: (eventType, fn, useCapture = false) => {
      dom_node.addEventListener(eventType, fn, useCapture)
    },
    addChild: (display_object) => {
      if (true) { //check if do isn't already in that parent
        children.push(display_object)
        dom_node.appendChild(display_object._node)
      }
    }
  }
}

const buildUseString = (elem) => {
  return `<use 
    x=0
    y=0
    xlink:href='#${elem.id}'
  />`
}

const Library = (inkscape_container, scratchpad_node) => {
  const directory = {}
  const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      const use_string = buildUseString(elem)
      scratchpad_node.insertAdjacentHTML('afterbegin', use_string)
      const node = scratchpad_node.children[0]
      scratchpad_node.removeChild(node)
      return DisplayObject(node, elem.getBBox())
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

augmentWithHints = (display_object) => {

  let _enableHints = true

  return Object.assign({},
    display_object, {
      get enableHints() {
        return _enableHints
      },
      set enableHints(asd) {
        _enableHints = asd
      }
    })
}

const fluxInit = (stage_element, inkscape_container) => {
  const stage_node = createStageNode(inkscape_container)

  //copy over layers to the stage element, then hide them
  for (let i = 0; i < inkscape_container.children.length; i++) {
    const child = inkscape_container.children[i]
    if (child.tagName === 'g') {
      const layer_clone = child.cloneNode(true)
      layer_clone.style.display = 'none'
      stage_node.appendChild(layer_clone)
    }
  }
  stage_element.appendChild(stage_node)

  //pass the first layer of the stage as a scratch pad for use_string initiation
  const library = Library(inkscape_container, stage_node.children[0])
  const stage = augmentWithHints(DisplayObject(stage_node, stage_node.getBBox()))

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
