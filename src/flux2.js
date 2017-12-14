const INKSCAPE_TITLE_TAG = 'title'
const SVGNS = "http://www.w3.org/2000/svg"

const DisplayObject = (dom_node, bbox) => {
  const children = []

  let _x = 0
  let _y = 0

  const _applyAttributes = () => {
    dom_node.setAttribute('transform', `translate(${-bbox.x + _x}, ${-bbox.y + _y})`)
  }

  //init
  _applyAttributes()

  return {
    _node: dom_node,
    _getDomNode: () => {
      if (dom_node) {
        return dom_node
      } else {
        parent_display_object.insertAdjacentHTML('beforeend', use_string)
      }
    },
    addChild: (display_object) => {
      if (true) { //check if do isn't already in that parent
        //const test_string = `<use x="0" y="0" height="100%" width="100%" xlink:href="#g2467"/>`
        //stage_node.insertAdjacentHTML('beforeend', test_string)
        //dom_node.insertAdjacentHTML('beforeend', test_string)
        //const node = dom_node.children[1]
        //console.log("node: ", node);
        //dom_node.appendChild(display_object._node)
        //console.log("display: ", display_object._node);
        
        //Can I remove then insert it again? Sweet, that works.
        //dom_node.removeChild(node)

        //dom_node.appendChild(node)
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
  //const node = document.createElementNS(SVGNS, 'use')
  //node.setAttributeNS(null, 'x', "0")
  //node.setAttributeNS(null, 'y', "0")
  //node.setAttributeNS(null, 'transform', "translate(-100, -50)")
  //node.setAttributeNS(null, 'height', "100%")
  //node.setAttributeNS(null, 'width', "100%")
  //node.setAttributeNS(null, 'xlink:href', `#${elem.id}`)
  
  //const node = document.createElement('use')
  //node.setAttribute('x', "0")
  //node.setAttribute('y', "0")
  //node.setAttribute('transform', "translate(-100, -50)")
  //node.setAttribute('height', "100%")
  //node.setAttribute('width', "100%")
  //node.setAttribute('xlink:href', `#${elem.id}`)
  //return node
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

  const children = {}

  stage_element.appendChild(stage_node)

  //pass the first layer of the stage as a scratch pad for use_string initiation
  const library = Library(inkscape_container, stage_node.children[0])
  const stage = DisplayObject(stage_node, stage_node.getBBox())
  //const stage = {
    //addChild: (display_object) => {
      //stage_node.appendChild(display_object.node)
      ////const test_string = `<use x="0" y="0" transform="translate(0, 0)" height="100%" width="100%" xlink:href="#g2467"/>`
      ////cant see it here
      ////const test_string = `<use x="0" y="0" height="100%" width="100%" xlink:href="#g2467"/>`
      //stage_node.insertAdjacentHTML('beforeend', test_string)
    //}
  //}
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
