// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';
import { shell } from 'electron';

// Notification state
global.notificationState = {
  flashing: false
};
const nativeImage = require('electron').nativeImage;

const iconUrl = url.format({
  pathname: path.join(__dirname, 'Icon/Icon.icns'),
  protocol: 'file:',
  slashes: true
});

const peaceIcon = nativeImage.createFromPath(path.join(__dirname, 'icons/peace.ico'));
const actionIcon = nativeImage.createFromPath(path.join(__dirname, 'icons/action.ico'));





// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}


app.on('ready', () => {
 // setApplicationMenu();

  const mainWindow = createWindow('main', {
    width: 1280,
    height: 720
  });

  mainWindow.loadURL("https://messenger.com/login.php");
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
       
    }
  });

  mainWindow.on('focus', (event, title) => {
      mainWindow.flashFrame(false);
      global.notificationState.flashing = false;
      mainWindow.setIcon(peaceIcon);
  });
});

// On all windows closed: close the thing
app.on('window-all-closed', () => {
  app.quit();
});


