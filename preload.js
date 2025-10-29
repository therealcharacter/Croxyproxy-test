const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Can expose minimal functions if needed
});
