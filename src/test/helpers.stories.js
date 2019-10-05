export default { title: 'Helpers' };

import flux from '../flux';

const init = (stageElement, inkscapeElement) => () => {

  var inkscapeSvg = document.getElementById('inkscape-svg');
  flux.init(stageElement, inkscapeElement, function(stage, library, helpers) {


    const screen1 = library.Screen1();

    stage.addChild(helpers.stageRect);
    stage.addChild(screen1);

    screen1.x = (stage.width - screen1.width)/2;
    screen1.y = (stage.height - screen1.height)/2;
    helpers.stageRect._node.style.opacity = 0.5;

    // This should be done at the last step
    inkscapeElement.style.display = 'none';
  })
};

export const stageRect = () => {

  const container = document.createElement('div');
  container.innerHTML = "<p>This can be used as the backdrop for opening dialogs/modals.</p>"
  const stageElement = document.createElement('div');
  const inkscapeElement = document.createElement('object');
  inkscapeElement.setAttribute('type', 'image/svg+xml');
  inkscapeElement.setAttribute('data', 'simple-example.svg');
  inkscapeElement.addEventListener('load', init(stageElement, inkscapeElement));
  inkscapeElement.style.opacity = 0;

  container.appendChild(stageElement);
  container.appendChild(inkscapeElement);

  return container;
};
