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


const instantiateNode = (elem, scratchpad_node) => {
  //Use string strategy:
  const buildUseString = (e) => {
    return `<use 
      x=0
      y=0
      xlink:href='#${e.id}'
    />`
  }
  //const use_string = buildUseString(elem)
  //scratchpad_node.insertAdjacentHTML('afterbegin', use_string)
  //const node = scratchpad_node.children[0]
  //scratchpad_node.removeChild(node)
  const selfCloseUseNode = (n) => {
    const htmlString  = n.outerHTML
    console.log("htmlString: ", htmlString + 'asd');
    scratchpad_node.insertAdjacentHTML('afterbegin', htmlString)
    const node = scratchpad_node.children[0]
    scratchpad_node.removeChild(node)
    return node
  }

  const svgNode = (n) => {
    var svgns = 'http://www.w3.org/2000/svg',
      xlinkns = 'http://www.w3.org/1999/xlink',
      use = document.createElementNS(svgns, 'use');

    for (var i = 0; i < n.attributes.length; i++) {
      var attrib = n.attributes[i];
      if (attrib.specified) {
        console.log(attrib.name + " = " + attrib.value);
        if (attrib.name === 'xlink:href') {
          use.setAttributeNS(xlinkns, attrib.name, attrib.value)
        } else {
          use.setAttributeNS(null, attrib.name, attrib.value)
        }
      }
    }
    //use.setAttributeNS(xlinkns, 'xlink:href', '#save')
    //document.getElementById('useSVG').appendChild(use);
    console.log("use: ", use);
    return use
    //return n
  }

  //deep clone strategy
  const clone = elem.cloneNode(true)
  //const visiting = [clone]

  ////do a dfs to find and self-close the use nodes: <use ...></use> → <use .../>
  //while (visiting.length > 0) {
    //const node = visiting.pop()
    //const children = Array.prototype.slice.call(node.children)
    //for (const child of children) {
      //if (child.tagName === 'use') {
        //const selfClosedUseNode = selfCloseUseNode(child);
        ////const selfClosedUseNode = svgNode(child);
        //node.replaceChild(selfClosedUseNode, child)
      //}
      //visiting.push(child)
    //}
  //}
  //const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  return clone
}

const Library = (inkscape_container, scratchpad_node, stage_node) => {
  const directory = {}
  const title_elements = Array.prototype.slice.call(stage_node.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    directory[name] = () => {
      const node = instantiateNode(elem, scratchpad_node)
      return DisplayObject(node, elem.getBBox())
      //return DisplayObject(elem, elem.getBBox())
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
    ['height', stageHeight],
    ['xmlns:x', SVGNSX]
  ]
  const stage_node = document.createElementNS(SVGNS, "svg")
  //for (let attribute of attributes) {
    //stage_node.setAttribute(...attribute)
  //}
  stage_node.setAttributeNS(null, 'viewBox', viewBox)
  stage_node.setAttributeNS(null, 'width', stageWidth)
  stage_node.setAttributeNS(null, 'height', stageHeight)
  //stage_node.setAttribute('xmlns:x', SVGNSX)
  //stage_node.setAttributeNS(SVGNSX, 'xmlns:x', SVGNSX)
  return stage_node
}

augmentWithHints = (display_object) => {

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
    //} else {
      const clone = child.cloneNode(true)
      stage_node.appendChild(clone)
    }
  }
  stage_element.appendChild(stage_node)

  //pass the first layer of the stage as a scratch pad for use_string initiation
  const library = Library(inkscape_container, stage_node.children[0], stage_node)
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
