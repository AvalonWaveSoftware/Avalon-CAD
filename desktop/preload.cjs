const {contextBridge, ipcRenderer} = require('electron');
const subscribe = channel => callback => {
  const handler = (_event, value) => callback(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};
contextBridge.exposeInMainWorld('AvalonDesktop', {
  platform: process.platform === 'darwin' ? 'mac' : process.platform,
  saveFile: (bytes, name) => ipcRenderer.invoke('avalon:save', {bytes, name}),
  openFile: () => ipcRenderer.invoke('avalon:open'),
  spill: {
    put: (id, bytes) => ipcRenderer.invoke('avalon-spill', {op: 'put', id, bytes}),
    get: id => ipcRenderer.invoke('avalon-spill', {op: 'get', id}),
    del: id => ipcRenderer.invoke('avalon-spill', {op: 'del', id}),
    clear: () => ipcRenderer.invoke('avalon-spill', {op: 'clear'})
  },
  onAction: subscribe('avalon:action'),
  onFile: subscribe('avalon:file'),
  onNotice: subscribe('avalon:notice')
});
