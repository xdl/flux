const INKSCAPE_TITLE_TAG = 'title'
const SVGNS = "http://www.w3.org/2000/svg"
const SVGNSX = "http://www.w3.org/1999/xlink"

const getInstances = (node) => {
  const instances = {}
  const title_elements = Array.prototype.slice.call(node.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    if (elem.id !== node.id) { //stops the element of interest (the parent) from being instantiated again
      const instance = DisplayObject(elem, elem.getBBox(), name, true)
      instances[name] = instance
    }
  }
  return instances
}

const DisplayObject = (dom_node, bbox, name, as_instance = false) => {

  //initial values
  //Second use of the title element:
  //2. As an exposed instance name in an instantiated class from the Library
  const instances = getInstances(dom_node)
  const children = Object.keys(instances).map((instance_name) => {
    return instances[instance_name]
  })

  //This is dodgy; not 100% how this is working; just fortunate coincidence atm
  let x, y
  if (!as_instance) { //if freshly instantiated, we have to offset the original x value from where it's been placed on the inkscape canvas
    x = 0
    y = 0
  } else {
    x = bbox.x
    y = bbox.y
  }

  let buttonMode = false

  const applyStyling = () => {
    dom_node.style.cursor = buttonMode ? 'pointer' : 'default'
  }
  const applyTransformAttribute = () => {
    dom_node.setAttribute('transform', `translate(${-bbox.x + x}, ${-bbox.y + y})`)
  }

  //init; normalise to zero. For instances, bbox is conveniently 0 anyway, so it stays in place.
  applyTransformAttribute()

  return Object.assign({ //base
    _node: dom_node,
    _children: children,
    _name: name, //for debug
    get x() {
      return x
    },
    set x(_x) {
      x = _x
      applyTransformAttribute()
    },
    get width() {
      return dom_node.getBBox().width
    },
    get height() {
      return dom_node.getBBox().height
    },
    get buttonMode() {
      return buttonMode
    },
    set buttonMode(_buttonMode) {
      buttonMode = _buttonMode
      applyStyling()
    },
    addEventListener: (eventType, fn, useCapture = false) => { //useCapture default is false
      dom_node.addEventListener(eventType, (e) => {
        e.stopPropagation() //stops the hint from bubbling any further to the hint listener on the stage
        fn()
      })
    },
    removeChild: (display_object) => {
      const index = children.indexOf(display_object)
      if (index > -1) {
        children.splice(index, 1)
        dom_node.removeChild(display_object._node)
      }
    },
    addChild: (display_object) => {
      const index = children.indexOf(display_object)
      if (index === -1) {
        children.push(display_object)
        dom_node.appendChild(display_object._node)
      }
    }
  }, instances) //apply instances to it after
}


const instantiateNode = (elem) => {
  const clone = elem.cloneNode(true)
  return clone
}

const Library = (stage_node) => {
  const directory = {}
  //First use of title elements:
  //1. As a class that's been 'Export for Actionscript'd
  const title_elements = Array.prototype.slice.call(stage_node.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      const node = instantiateNode(elem)
      return DisplayObject(node, elem.getBBox(), name)
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

  //init. Default true
  let enableHints = true

  const showClickableAreas = () => {
    //do a tree search
    const to_visit = [display_object]
    while (to_visit.length > 0) {
      const visiting = to_visit.pop()
      for (const child of visiting._children) {
        if (child.buttonMode) {
          child._node.setAttribute('class', '')
          //Need to access a DOM-esque value (not function) like this to trigger a reflow: https://css-tricks.com/restart-css-animation/
          child._node.scrollTop
          child._node.setAttribute('class', 'fadey')
        }
        to_visit.push(child)
      }
    }
    const fadeyElement = document.getElementById('fadeyElement')
    fadeyElement.classList.remove('fadey')
    void fadeyElement.offsetWidth
    fadeyElement.classList.add('fadey')
  }

  display_object.addEventListener('click', showClickableAreas)

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

  //copy over layers to the stage element, then hide them. This is somewhat necessary, because we need the elements in the svg for any use elements to refer back to.
  //TODO: figure out whether or not hiding them makes sense as default
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
  const stage = augmentWithHints(DisplayObject(stage_node, stage_node.getBBox(), 'stage'))

  return {
    stage,
    library
  }
}

module.exports = {
  init: (stage_element, library_element, callback) => {
    const inkscape_container = library_element.contentDocument.firstElementChild

    //adding some keyframe data. We'll need this when we don't want to manually do stuff to the index.html of the demo
    const style = document.createElement('style')
    style.type = 'text/css'
    const hints_css = `
      .fadey {
        animation: fadey 0.4s linear forwards;
      }
      @keyframes fadey {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }`;
    style.innerHTML = hints_css
    document.getElementsByTagName('head')[0].appendChild(style)

    const flux = {} //TODO: get some sick helper methods in here yo

    const {
      stage,
      library
    } = fluxInit(stage_element, inkscape_container)
    return callback(stage, library, flux)
  }
}
