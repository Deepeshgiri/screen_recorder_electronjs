// main.js
const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload.js
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html'); // Load the HTML file
}

// Handle IPC call to get desktop sources
ipcMain.handle('GET_VIDEO_SOURCES', async () => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
  return sources;
});

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow);
