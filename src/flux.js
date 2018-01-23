const INKSCAPE_TITLE_TAG = 'title'
const CLASS_HINTBOX = 'fadey'
const HINT_FADEOUT_SECONDS = 0.6

//dom attributes
const REPLICANT_MARKER = 'replicant'
const BUTTON_MODE = 'buttonMode'

const SVGNS = "http://www.w3.org/2000/svg"
const SVGNSX = "http://www.w3.org/1999/xlink"
const {
  decomposeTransformAttribute,
  calculateNodeTranslation,
  getTransformAttributeStringList,
  parseTranslateAttribute
} = require('./lib/decompose.js')

const getTitle = (elem) => {
  for (let i = 0; i < elem.children.length; i++) {
    const child = elem.children[i]
    if (child.tagName === INKSCAPE_TITLE_TAG) {
      return child.innerHTML
    }
  }
  return null
}

const wrapInstances = (node, node_name) => {
  const instances = {}
  //Second use of the title element:
  //2. As an exposed instance name in an instantiated class from the Library
  const displayObjectify = (elem, title) => {
    const t_list = getTransformAttributeStringList(elem)
    //assume the last one has a translation transformation:
    const translate = parseTranslateAttribute(t_list[0])
    const display_object = augmentWithInstances(DisplayObject(elem, t_list.slice(1), name, translate[0], translate[1]), node_name)
    return display_object
  }
  const to_visit = [node]
  while (to_visit.length > 0) {
    const visiting = to_visit.pop()
    for (let i = 0; i < visiting.children.length; i++) {
      const child = visiting.children[i]
      const title = getTitle(child)
      if (title) {
        const display_object = displayObjectify(child, title)
        instances[title] = display_object
      }
      if (!child.hasAttribute(REPLICANT_MARKER)) {
        to_visit.push(child)
      }
    }
  }
  return instances
}

const augmentWithInstances = (display_object, name) => {
  const instances = wrapInstances(display_object._node, name)
  for (let i_name of Object.keys(instances)) {
    const instance = instances[i_name]
    display_object._children.push(instance)
  }
  return Object.assign(display_object,
    instances)
}

const DisplayObject = (dom_node, transform_offsets, name, x = 0, y = 0) => {

  //initial values
  const children = []

  let buttonMode = false

  const applyStyling = () => {
    dom_node.style.cursor = buttonMode ? 'pointer' : 'default'
  }
  const applyTransformAttribute = () => {
    const transform = `translate(${x}, ${y})`
    dom_node.setAttribute('transform', `
      ${transform}
      ${transform_offsets.join('')}
    `)
  }

  //init:
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
    get y() {
      return y
    },
    set y(_y) {
      y = _y
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
      if (buttonMode) { //for the dom traversal to pick up on when clicked
        dom_node.setAttribute(BUTTON_MODE, true)
      } else {
        dom_node.removeAttribute(BUTTON_MODE)
      }
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
  })
}

const _instantiateNode = (elem, inkscape_node) => {
  const instantiate = (n) => {
    const clone = n.cloneNode(true)
    postOrder(clone)
    return clone
  }
  const replaceChild = (parent, use_node) => {
    const transform_string = use_node.getAttribute('transform')
    const use_transform = decomposeTransformAttribute(transform_string)
    const replacement_id = use_node.getAttribute('xlink:href').slice(1)

    const replacement_node = inkscape_node.getElementById(replacement_id)
    const replaced_node = instantiate(replacement_node)
    const followed_transform = decomposeTransformAttribute(replaced_node.getAttribute('transform'))

    //TODO: understand why this works, and how coordinate systems behave with use elements properly
    replaced_node.setAttribute('transform', `
      translate(${use_transform.translate[0]},${use_transform.translate[1]})
      scale(${use_transform.scale[0]},${use_transform.scale[1]})
      translate(${followed_transform.translate[0]},${followed_transform.translate[1]})
      scale(${followed_transform.scale[0]},${followed_transform.scale[1]})
    `)

    //set a marker for the replaced node so that when we instantiate instances, it doesn't traverse past this point
    replaced_node.setAttribute(REPLICANT_MARKER, true)

    //preserve any title tags
    if (use_node.children[0] && use_node.children[0].tagName === INKSCAPE_TITLE_TAG) {
      const title_node = use_node.children[0]
      replaced_node.appendChild(title_node)
    }

    parent.replaceChild(replaced_node, use_node)
  }
  const postOrder = (p) => {
    for (let i = 0; i < p.children.length; i++) {
      const child = p.children[i]
      postOrder(child)
      if (child.tagName === 'use') {
        replaceChild(p, child)
      }
    }
  }

  return instantiate(elem)
}


const instantiateNode = (elem, name, inkscape_node) => {
  return _instantiateNode(elem, inkscape_node)
}

const directInkscapeChildIsLayer = (node) => {
  return node.tagName === 'g'
}

const Library = (inkscape_node) => {
  const directory = {}
  //First use of title elements:
  //1. As a class that's been 'Export for Actionscript'd, if it's directly exposed in a layer
  for (let i = 0; i < inkscape_node.children.length; i++) {
    if (directInkscapeChildIsLayer(inkscape_node.children[i])) { //if layer
      for (let j = 0; j < inkscape_node.children[i].children.length; j++) {
        const child_node = inkscape_node.children[i].children[j]
        const title = getTitle(child_node)
        if (title) {
          directory[title] = () => {
            const node = instantiateNode(child_node, title, inkscape_node)
            const bbox = child_node.getBBox()
            const transform_offsets = [`translate(${-bbox.x}, ${-bbox.y})`]
            return augmentWithInstances(
              DisplayObject(node, transform_offsets, title), title)
          }
        }
      }
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

const generateHintBox = (bbox, transform_attributes) => {
  const node = document.createElementNS(SVGNS, 'rect')
  node.style.opacity = 1;
  node.style.fill = '#851422';
  node.style.stroke = '#431422';
  node.style['stroke-width'] = 0.5;
  node.style['fill-opacity'] = 0.7;
  node.style['stroke-opacity'] = 0.7;
  node.setAttribute('width', bbox.width)
  node.setAttribute('height', bbox.height)
  node.setAttribute('x', bbox.x)
  node.setAttribute('y', bbox.y)
  node.setAttribute('class', CLASS_HINTBOX)
  node.setAttribute('transform', transform_attributes)
  return node
}

const augmentWithHints = (display_object) => {

  //init. Default true
  let enableHints = true

  const createRemoveHintNodeFn = (parent_node, hint_node) => {
    return () => {
      parent_node.removeChild(hint_node)
    }
  }

  const showClickableAreas = () => {

    //do a tree search
    const to_visit = [display_object._node]
    while (to_visit.length > 0) {
      const visiting = to_visit.pop()
      for (let i = 0; i < visiting.children.length; i++) {
        const child = visiting.children[i]
        if (child.getAttribute(BUTTON_MODE)) {
          const hint_box = generateHintBox(child.getBBox(), child.getAttribute('transform'))
          visiting.appendChild(hint_box)
          window.setTimeout(createRemoveHintNodeFn(visiting, hint_box),HINT_FADEOUT_SECONDS * 1000)
        }
        to_visit.push(child)
      }
    }
  }

  //init
  display_object.addEventListener('click', showClickableAreas)

  return Object.assign(display_object, {
      get enableHints() {
        return enableHints
      },
      set enableHints(_enableHints) {
        enableHints = _enableHints
        //TODO: toggle this
      }
    })
}

const fluxInit = (stage_element, inkscape_container) => {
  const stage_node = createStageNode(inkscape_container)

  for (let i = 0; i < inkscape_container.children.length; i++) {
    const child = inkscape_container.children[i]
    if (child.tagName === 'defs') { //copy over defs layer for swatches etc.
      const clone = child.cloneNode(true)
      stage_node.appendChild(clone)
    }
  }
  stage_element.appendChild(stage_node)

  const library = Library(inkscape_container)
  const stage = augmentWithHints(DisplayObject(stage_node, [], 'stage'))

  return {
    stage,
    library
  }
}

module.exports = {
  version: '0.0.1',
  init: (stage_element, library_element, callback) => {
    const inkscape_container = library_element.contentDocument.firstElementChild

    //TODO: put this header mutation into a separate function
    //adding some keyframe data. We'll need this when we don't want to manually do stuff to the index.html of the demo
    const style = document.createElement('style')
    style.type = 'text/css'
    const hints_css = `
      .${CLASS_HINTBOX} {
        animation: fadeInOut ${HINT_FADEOUT_SECONDS}s ease-out forwards;
      }
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
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
