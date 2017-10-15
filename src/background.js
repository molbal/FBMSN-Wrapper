// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, Tray} from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';
import { shell } from 'electron';

// Notification state
global.notificationState = {
  flashing: false,
  alticon: false
};

const nativeImage = require('electron').nativeImage;
const iconUrl = url.format({
  pathname: path.join(__dirname, 'Icon/Icon.icns'),
  protocol: 'file:',
  slashes: true
});


// Icons: one for normal display, another for notifications
const peaceIcon = nativeImage.createFromPath(path.join(__dirname, 'icons/peace.ico'));
const actionIcon = nativeImage.createFromPath(path.join(__dirname, 'icons/action.ico'));
const actionIcon2 = nativeImage.createFromPath(path.join(__dirname, 'icons/action2.ico'));


// Player to play sounds on notifications
var player = require('play-sound')({});


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
let tray = null;
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}


app.on('ready', () => {

  // Tray icon 
  tray = new Tray(peaceIcon);
  tray.setToolTip('Facebook Messenger');
  const mainWindow = createWindow('main', {
    width: 1280,
    height: 720
  });

  // Flash the icons if there is a notification
  setInterval(function() {
    if (global.notificationState.flashing) {
      global.notificationState.alticon = !global.notificationState.alticon;
      mainWindow.setIcon(global.notificationState.alticon ? actionIcon : actionIcon2);
      tray.setImage(global.notificationState.alticon ? actionIcon : actionIcon2);
    }
  },500);

  // Click the tray to show or hide the window
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  // Menu of the tray icon
  const trayMenu = Menu.buildFromTemplate([
    {label: 'About this app',click () { shell.openExternal('https://github.com/molbal/FBMSN-Wrapper')}},
    {label: 'Exit', click() {app.quit()}}
  ]);
  tray.setContextMenu(trayMenu);

  // Load login view: this will redirect if already logged in
  mainWindow.loadURL("https://messenger.com/login.php");

  // Let's not spawn infinite electron windows
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // On a new message a title like this: (1) Messenger
  mainWindow.on('page-title-updated', (event, title) => {
    if (!global.notificationState.flashing && title.startsWith("(")) {
      mainWindow.flashFrame(true);
      global.notificationState.flashing = true;
      mainWindow.setIcon(actionIcon);
      tray.setImage(actionIcon);
      tray.setToolTip('You got something on Facebook');

      player.play('app/media/ping.mp3', function(exception) {
        console.error("Cannot play notification sound", exception);
      });
    }
  });

  // Stop flashing when the focus returns
  mainWindow.on('focus', (event, title) => {
      mainWindow.flashFrame(false);
      global.notificationState.flashing = false;
      mainWindow.setIcon(peaceIcon);
      tray.setImage(peaceIcon);
      tray.setToolTip('Facebook Messenger - Click this icon to hide or show the window');
  });
});

// On all windows closed: close the thing
app.on('window-all-closed', () => {
  app.quit();
});


