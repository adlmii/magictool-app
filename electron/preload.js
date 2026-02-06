const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  processImage: (data) => ipcRenderer.invoke('process-image', data),
  saveImage: (data) => ipcRenderer.invoke('save-image', data),
  getFilePath: (file) => webUtils.getPathForFile(file),

  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
});