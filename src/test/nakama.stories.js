export default { title: 'Nakama' };

import flux from '../flux';

const init = (inkscapeSvg, stageElement) => () => {

  // var inkscapeSvg = document.getElementById('inkscape-svg');

  flux.init(stageElement, inkscapeSvg, function(stage, library, helpers) {

    var page_home_welcome = library.page_home_welcome();

    var last_home_page = null;

    page_home_welcome.join_room_btn.buttonMode = true;
    page_home_welcome.join_room_btn.addEventListener('click', function() {
      stage.removeChild(page_home_welcome);
      stage.addChild(page_home_occupants);
      last_home_page = page_home_occupants;
    });

    var page_home_occupants = library.page_home_occupants();
    page_home_occupants.roompage.roombar.app.buttonMode = true;
    page_home_occupants.roompage.roombar.messages.buttonMode = true;
    page_home_occupants.roompage.roombar.messages.addEventListener('click', function() {
      stage.removeChild(page_home_occupants);
      stage.addChild(page_home_messages);
      last_home_page = page_home_messages;
    });
    page_home_occupants.roompage.roombar.app.addEventListener('click', function() {
      stage.removeChild(page_home_occupants);
      stage.addChild(page_home_app);
      last_home_page = page_home_app;
    });

    var page_home_messages = library.page_home_messages();
    page_home_messages.roompage.roombar.app.buttonMode = true;
    page_home_messages.roompage.roombar.occupants.buttonMode = true;
    page_home_messages.roompage.roombar.app.addEventListener('click', function() {
      stage.removeChild(page_home_messages);
      stage.addChild(page_home_app);
      last_home_page = page_home_app;
    });
    page_home_messages.roompage.roombar.occupants.addEventListener('click', function() {
      stage.removeChild(page_home_messages);
      stage.addChild(page_home_occupants);
      last_home_page = page_home_occupants;
    });

    var page_home_app = library.page_home_app();
    page_home_app.roompage.roombar.messages.buttonMode = true;
    page_home_app.roompage.roombar.occupants.buttonMode = true;
    page_home_app.roompage.roombar.messages.addEventListener('click', function() {
      stage.removeChild(page_home_app);
      stage.addChild(page_home_messages);
      last_home_page = page_home_messages;
    });
    page_home_app.roompage.roombar.occupants.addEventListener('click', function() {
      stage.removeChild(page_home_app);
      stage.addChild(page_home_occupants);
      last_home_page = page_home_occupants;
    });

    // Nothing to do here
    var page_about = library.page_about();


    // using last_home_page finally
    var page_nav_sidebar = library.page_nav_sidebar();
    page_nav_sidebar.about_btn.buttonMode = true;
    page_nav_sidebar.about_btn.addEventListener('click', function() {
      stage.removeChild(page_nav_sidebar);
      stage.addChild(page_about);
    })
    page_nav_sidebar.home_btn.buttonMode = true;
    page_nav_sidebar.home_btn.addEventListener('click', function() {
      stage.removeChild(page_nav_sidebar);
      stage.addChild(last_home_page);
    })
    page_nav_sidebar.dismiss_btn.buttonMode = true;
    page_nav_sidebar.dismiss_btn.addEventListener('click', function() {
      stage.removeChild(page_nav_sidebar);
      stage.addChild(last_home_page);
    });

    var page_home_settings = library.page_home_settings();
    page_home_settings.roombar_settings_open.close_btn.buttonMode = true;
    page_home_settings.roombar_settings_open.close_btn.addEventListener('click', function() {
      stage.removeChild(page_home_settings);
      stage.addChild(last_home_page);
    });
    page_home_settings.roombar_settings_open.back_btn.buttonMode = true;
    page_home_settings.roombar_settings_open.back_btn.addEventListener('click', function() {
      stage.removeChild(page_home_settings);
      stage.addChild(page_home_welcome);
      last_home_page = page_home_welcome;
    });


    var room_screens = [
      page_home_occupants,
      page_home_messages,
      page_home_app
    ];
    room_screens.forEach(function(screen) {
      screen.roompage.toppage.topbar_mobile.mobile_nav.buttonMode = true;
      screen.roompage.toppage.topbar_mobile.mobile_nav.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(page_nav_sidebar);
      });
      screen.roompage.toppage.topbar_mobile.logo.buttonMode = true;
      screen.roompage.toppage.topbar_mobile.logo.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(last_home_page);
      });

      screen.roompage.roombar.settings_btn.buttonMode = true;
      screen.roompage.roombar.settings_btn.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(page_home_settings);
      });

      // back to welcome screen
      screen.roompage.roombar.back_btn.buttonMode = true;
      screen.roompage.roombar.back_btn.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(page_home_welcome);
        last_home_page = page_home_welcome;
      });
    });

    var nonroom_screens = [
      page_home_settings,
      page_home_welcome,
      page_about
    ];
    nonroom_screens.forEach(function(screen) {
      screen.toppage.topbar_mobile.mobile_nav.buttonMode = true;
      screen.toppage.topbar_mobile.mobile_nav.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(page_nav_sidebar);
      });
      screen.toppage.topbar_mobile.logo.buttonMode = true;
      screen.toppage.topbar_mobile.logo.addEventListener('click', function() {
        stage.removeChild(screen);
        stage.addChild(last_home_page);
      });
    });

    //init
    stage.addChild(page_home_welcome);
    last_home_page = page_home_welcome;

    // show clickable areas, even when you haven't clicked on the svg element
    window.addEventListener('click', function() {
      helpers.showClickableAreas()
    })

    inkscapeSvg.style.display = 'none';
  })
};

export const actual = () => {

  const container = document.createElement('div');

  const stageElement = document.createElement('div');

  const inkscapeElement = document.createElement('object');
  inkscapeElement.setAttribute('type', 'image/svg+xml');
  inkscapeElement.setAttribute('data', 'nakama.svg');
  inkscapeElement.style.opacity = 0;

  inkscapeElement.addEventListener('load', init(inkscapeElement, stageElement));

  container.appendChild(stageElement);
  container.appendChild(inkscapeElement);

  return container;
};
