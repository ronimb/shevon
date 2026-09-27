const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shevonDesktop', {
  setHistoryOpen: (open) => ipcRenderer.invoke('shevon:setHistoryOpen', !!open),
  setAlwaysOnTop: (on) => ipcRenderer.invoke('shevon:setAlwaysOnTop', !!on),
  setBringToFrontAccelerator: (accel) =>
    ipcRenderer.invoke('shevon:setBringToFrontAccelerator', accel),
});
