const INKSCAPE_TITLE_TAG = 'title'
const Library = (svg) => {
  const directory = {}
  const title_elements = Array.prototype.slice.call(svg.getElementsByTagName(INKSCAPE_TITLE_TAG))
  for (const title of title_elements) {
    const name = title.innerHTML
    directory[name] = () => {
      return title.parentNode
    }
  }
  return directory
}

const createStage = (library_element) => {
  const inkscape_container = library_element.contentDocument.firstElementChild
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

const Stage = (dom, library_element) => {
  const stage = createStage(library_element)
  dom.appendChild(stage)
  const addChild = (element) => {
    stage.appendChild(element)
  }
  return {
    addChild
    //removeChild
  }
}

const getTitleElements = (inkscape_contents) => {
}

module.exports = {
  init: (stage_element, library_element, callback) => {
    const stage = Stage(stage_element, library_element)
    const library = Library(library_element.contentDocument)
    return callback(stage, library)
  }
}
