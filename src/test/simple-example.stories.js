export default { title: 'Simple Example' };

import flux from '../flux';

const init = (stageElement, inkscapeElement) => () => {

  var inkscapeSvg = document.getElementById('inkscape-svg');
  flux.init(stageElement, inkscapeElement, function(stage, library, helpers) {

    const screen1 = library.Screen1();
    const screen2 = library.Screen2();

    stage.addChild(screen1);

    screen1.next_screen_button.addEventListener('click', function() {
      stage.removeChild(screen1);
      stage.addChild(screen2);
    });

    screen2.prev_screen_button.addEventListener('click', function() {
      stage.removeChild(screen2);
      stage.addChild(screen1);
    });

    // show clickable areas, even when you haven't clicked on the svg element
    window.addEventListener('click', function() {
      helpers.showClickableAreas()
    })

    // This should be done at the last step
    inkscapeElement.style.display = 'none';
  })
};

export const actual = () => {
  const container = document.createElement('div');

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

export const nestedInstanceCorrectlyPositioned = () => {
  const container = document.createElement('div');
  container.innerHTML = "<p>Named instances can have (one) translate or matrix operation on the group.</p>"

  const stageElement = document.createElement('div');

  const inkscapeElement = document.createElement('object');
  inkscapeElement.setAttribute('type', 'image/svg+xml');
  inkscapeElement.setAttribute('data', 'simple-example-bug.svg');
  inkscapeElement.addEventListener('load', init(stageElement, inkscapeElement));
  inkscapeElement.style.opacity = 0;

  container.appendChild(stageElement);
  container.appendChild(inkscapeElement);

  return container;
};
