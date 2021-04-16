const path = require('path'),
  electron = require('electron');
const { app, BrowserWindow } = electron;

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    width: 800,
    height: 600
  });
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
});
