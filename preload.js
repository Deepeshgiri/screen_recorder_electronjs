// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose a method to get video sources
contextBridge.exposeInMainWorld('electronAPI', {
  getVideoSources: () => ipcRenderer.invoke('GET_VIDEO_SOURCES'),
});
