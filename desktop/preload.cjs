const {contextBridge, ipcRenderer} = require('electron');
const subscribe = channel => callback => {
  const handler = (_event, value) => callback(value);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};
contextBridge.exposeInMainWorld('AvalonDesktop', {
  platform: 'mac',
  saveFile: (bytes, name) => ipcRenderer.invoke('avalon:save', {bytes, name}),
  openFile: () => ipcRenderer.invoke('avalon:open'),
  onAction: subscribe('avalon:action'),
  onFile: subscribe('avalon:file'),
  onNotice: subscribe('avalon:notice')
});
