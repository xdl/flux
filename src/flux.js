const INKSCAPE_TITLE_TAG = 'title'
const SVGNS = "http://www.w3.org/2000/svg"
const SVGNSX = "http://www.w3.org/1999/xlink"

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
    _children: children,
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


const instantiateNode = (elem) => {
  const clone = elem.cloneNode(true)
  return clone
}

const Library = (stage_node) => {
  const directory = {}
  const title_elements = Array.prototype.slice.call(stage_node.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      const node = instantiateNode(elem)
      return DisplayObject(node, elem.getBBox())
    }
  }
  return directory
}

const createStageNode = (inkscape_container) => {
  const viewBox = inkscape_container.getAttribute('viewBox')
  const stageWidth = inkscape_container.getAttribute('width')
  const stageHeight = inkscape_container.getAttribute('height')
  const stage_node = document.createElementNS(SVGNS, "svg")
  stage_node.setAttributeNS(null, 'viewBox', viewBox)
  stage_node.setAttributeNS(null, 'width', stageWidth)
  stage_node.setAttributeNS(null, 'height', stageHeight)
  return stage_node
}

const augmentWithHints = (display_object) => {

  //init
  let enableHints = true

  display_object.addEventListener('click', () => {
    //do a tree search
    const to_visit = [display_object]
    while (to_visit.length > 0) {
      const visiting = to_visit.pop()
      for (const child of visiting._children) {
        if (child.buttonMode) {
          console.log("toggling this guy!");
        }
        to_visit.push(child)
      }
    }
    const fadeyElement = document.getElementById('fadeyElement')
    fadeyElement.classList.remove('fadey')
    void fadeyElement.offsetWidth
    fadeyElement.classList.add('fadey')
  })
  return Object.assign({},
    display_object, {
      get enableHints() {
        return enableHints
      },
      set enableHints(_enableHints) {
        enableHints = _enableHints
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
    } else if (child.tagName === 'defs') {
      const clone = child.cloneNode(true)
      stage_node.appendChild(clone)
    }
  }
  stage_element.appendChild(stage_node)

  //pass the first layer of the stage as a scratch pad for use_string initiation
  const library = Library(stage_node)
  const stage = augmentWithHints(DisplayObject(stage_node, stage_node.getBBox()))

  return {
    stage,
    library
  }
}

module.exports = {
  init: (stage_element, library_element, callback) => {
    const inkscape_container = library_element.contentDocument.firstElementChild

    //adding some keyframe data:
    //const style = document.createElement('style')
    //style.type = 'text/css'
    //const keyFrames = `
      //@keyframes fadey {
        //0%,100% { opacity: 0; }
        //50% { opacity: 1; }
      //}`;
    //style.innerHTML = keyFrames
    //document.getElementsByTagName('head')[0].appendChild(style)

    const {
      stage,
      library
    } = fluxInit(stage_element, inkscape_container)
    return callback(stage, library)
  }
}
