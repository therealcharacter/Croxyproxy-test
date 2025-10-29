// preload.js — safe bridge (exposes minimal API)
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('privateAPI', {
  hello: () => 'private-electron-browser'
});
