import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

contextBridge.exposeInMainWorld('electron', electronAPI);
contextBridge.exposeInMainWorld('api', {
  saveFile: (id: number, data: {}) => ipcRenderer.invoke('save-file', id, data),
  createSave: (id: number) => ipcRenderer.invoke('create-save', id),
  loadFile: (id: number) => ipcRenderer.invoke('load-file', id)
});

