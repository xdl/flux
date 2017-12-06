function convertCoords(dom_node) {

  var offset = dom_node.getBoundingClientRect();
  var matrix = dom_node.getScreenCTM();
  var x = offset.x
  var y = offset.y

  return {
    x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
    y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
  };
}

const INKSCAPE_TITLE_TAG = 'title'
//Node, {x, y, width, height, bottom, top, left, right}
const DisplayObject = (dom_node, dom_rect, container_width, container_height) => {
  //zero the node:
  //dom_node.setAttribute('transform', `translate(${-dom_rect.x}, ${-dom_rect.y})`)
  
  //can't see it
  //dom_node.setAttribute('transform', `translate(${-dom_rect.x}, 0)`)

  //doesn't do anything
  //dom_node.setAttribute('transform', `translate(0, 0)`)

  //doesn't do anything
  //dom_node.setAttribute('transform', `translate(${-74}, 0)`)

  //dom_node.setAttribute('transform', `translate(${-dom_rect.x + 207}, 0)`)
  //console.log("-dom_rect.x + 207: ", -dom_rect.x + 207);
  return {
    node: dom_node,
    dom_rect,
    getCoords: () => {
      return convertCoords(dom_node)
    }
  }
}

const Library = (inkscape_container) => {
  const directory = {}
  //needs to be in pixels for now
  const width = inkscape_container.getAttribute('width')
  const height = inkscape_container.getAttribute('height')
  const title_elements = Array.prototype.slice.call(inkscape_container.getElementsByTagName(INKSCAPE_TITLE_TAG))
  //console.log("inkscape_container.getScreenCTM(): ", inkscape_container.getScreenCTM());
  for (const title of title_elements) {
    const name = title.innerHTML
    const elem = title.parentNode
    //console.log("elem.getScreenCTM(): ", elem.getScreenCTM());
    //console.log("elem.getBBox(): ", elem.getBBox());
    //console.log("elem.getBoundingClientRect(): ", elem.getBoundingClientRect());
    directory[name] = () => {
      return DisplayObject(
        elem.cloneNode(),
        //elem.getBBox(),
        elem.getBoundingClientRect(),
        width,
        height
      )
    }
  }
  return directory
}

const createStage = (inkscape_container) => {
  const viewBox = inkscape_container.getAttribute('viewBox')
  console.log("viewBox: ", viewBox);
  const attributes = [
    ['viewBox', viewBox],
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
  console.log("stage.getScreenCTM(): ", stage.getScreenCTM());
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
