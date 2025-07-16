interface ElectronAPI {
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    onSpotifyTaskTitle: (callback: (title: string) => void) => () => void;
    onSpotifyTaskLyrics: (callback: (text: string) => void) => () => void;
    onSpotifyTaskColor: (callback: (color: string) => void) => () => void;
    onSpotifyTaskSecondColor: (callback: (second_color: string) => void) => () => void;
    onSpotifyTasTextColor: (callback: (textcolor: string) => void) => () => void;
    onSpotifyTaskSettings: (callback: (settings: { panelStyle: boolean, fullscreen: boolean, hide: false }) => void) => () => void;
}

interface Window {
    electron: ElectronAPI;
    ipcRenderer: {
        send: (channel: string, data: unknown) => void;
    };
}