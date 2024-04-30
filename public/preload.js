//import { IpcRendererEvent } from 'electron'

const { contextBridge, ipcRenderer } = require('electron')

const fileSystem = {
    saveLevel (level, dir, data) {
        return ipcRenderer.invoke('save-level', level, dir, data)
    },
    readLevel (level, dir) {
        return ipcRenderer.invoke('read-level', level, dir)
    }, 
    readDirLevels () {
        return ipcRenderer.invoke('read-dir-levels')
    },
   //  pathExists (path) { ipcRenderer.invoke('path-exists', path) }
}

const API = { fileSystem: fileSystem }

contextBridge.exposeInMainWorld('API', API) 