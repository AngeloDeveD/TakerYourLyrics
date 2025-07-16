import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

ipcRenderer.setMaxListeners(20);

contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  onSpotifyTaskTitle: (callback: (title: string) => void) => {
    const listener = (_event: IpcRendererEvent, title: string) => callback(title);
    ipcRenderer.on('spotify-task-title', listener);
    return () => ipcRenderer.removeListener('spotify-task-title', listener);
  },
  onSpotifyTaskLyrics: (callback: (text: string) => void) => {
    const listener = (_event: IpcRendererEvent, text: string) => callback(text);
    ipcRenderer.on('spotify-task-lyrics', listener);
    return () => ipcRenderer.removeListener('spotify-task-lyrics', listener);
  },
  onSpotifyTaskColor: (callback: (color: string) => void) => {
    const listener = (_event: IpcRendererEvent, color: string) => callback(color);
    ipcRenderer.on('spotify-task-color', listener);
    return () => ipcRenderer.removeListener('spotify-task-color', listener);
  },
  onSpotifyTaskSecondColor: (callback: (second_color: string) => void) => {
    const listener = (_event: IpcRendererEvent, second_color: string) => callback(second_color);
    ipcRenderer.on('spotify-task-second-color', listener);
    return () => ipcRenderer.removeListener('spotify-task-second-color', listener);
  },
  onSpotifyTasTextColor: (callback: (textcolor: string) => void) => {
    const listener = (_event: IpcRendererEvent, textcolor: string) => callback(textcolor);
    ipcRenderer.on('spotify-task-text-color', listener);
    return () => ipcRenderer.removeListener('spotify-task-text-color', listener);
  },
  onSpotifyTaskSettings: (callback: (settings: { panelStyle: boolean, fullscreen: boolean, hide: boolean }) => void) => {
    const listener = (_event: IpcRendererEvent, settings: { panelStyle: boolean, fullscreen: boolean, hide: boolean }) => {
      console.log('Received settings:', settings);
      callback(settings);
    };
    ipcRenderer.on('spotify-task-settings', listener);
    return () => ipcRenderer.removeListener('spotify-task-settings', listener);
  },
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data: unknown) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => ipcRenderer.on(channel, listener),
});
