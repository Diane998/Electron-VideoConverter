const electron = require('electron'),
  ffmpeg = require('fluent-ffmpeg'),
  _ = require('lodash');
const { app, BrowserWindow, ipcMain } = electron;

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

ipcMain.on('videos:added', (e, videos) => {
  Promise.all(
    _.map(videos, video => {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(video.path, (err, metadata) => {
          resolve({
            ...video,
            duration: metadata.format.duration,
            format: 'avi'
          });
        });
      });
    })
  ).then(results => mainWindow.webContents.send('metadata:complete', results));
});

ipcMain.on('conversion:start', (e, videos) => {
  _.each(videos, video => {
    const outputDir = video.path.split(video.name)[0],
      outputName = video.name.split('.')[0];
    const outputPath = `${outputDir}${outputName}.${video.format}`;

    ffmpeg(video.path)
      .output(outputPath)
      .on('progress', ({ timemark }) =>
        mainWindow.webContents.send('conversion:progress', { video, timemark })
      )
      .on('end', () =>
        mainWindow.webContents.send('conversion:end', { video, outputPath })
      )
      .run();
  });
});
