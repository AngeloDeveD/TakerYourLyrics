import { app, BrowserWindow, ipcMain, Menu, IpcMainEvent, Tray } from 'electron';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';
import electronSquirrelStartup from 'electron-squirrel-startup';

interface SongResponse {
  response: {
    hits: Array<{
      result: {
        path: string;
        api_path: string;
      };
    }>;
  };
}

interface SongColorResponse {
  response: {
    song: {
      song_art_primary_color: string,
      song_art_text_color: string,
      song_art_secondary_color: string,
    };
  };
}

interface Settings {
  panelStyle: boolean,
  fullscreen: boolean,
  hide: boolean,
}

let songTitle: string = "";

let tray: Tray | null = null;

//const API_KEY: string = "8f87da7016mshabc3750b2843a3fp1ed585jsnecf31a2f1fc5";
const API_KEY: string = "owIqveJ5vk1ycBZxGhJNyfRI4cG4IKyK3nG9aRBvdmGw7hY3UvxSdaJ6mgbkZDW4";

if (process.env.NODE_ENV !== 'production' && electronSquirrelStartup) {
  app.quit();
}

const configPath = path.join(app.getPath('appData'), 'Raoul', 'Config', 'data.json');

function loadSettings(): Settings {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Settings;
  } catch (error) {
    return { panelStyle: true, fullscreen: false, hide: false }; // базовые настройки
  }
}

function saveSettings(settings: Settings): void {
  fs.writeFileSync(configPath, JSON.stringify(settings));
}

async function getLyrics(song: string): Promise<[string, string, string, string]> {
  const [title, author] = song.split(" - ");

  try {
    const searchResponse = await axios.get<SongResponse>('https://api.genius.com/search/', {
      params: {
        q: `${title} ${author}`
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (searchResponse.data && searchResponse.data.response.hits.length > 0) {
      const songPath = searchResponse.data.response.hits[0].result.path;

      const songResponse = await axios.get<string>(`https://genius.com${songPath}`);

      const $ = cheerio.load(songResponse.data);
      let lyricsHtml: string = '<br></br>';
      let color: string = '';
      let second_color: string = '';
      let textcolor: string = '';

      $('div[class*="Lyrics__Container"]').each((_i, elem) => {
        let containerHtml = $(elem).html()?.replace(/ class="[^"]*"/g, '') || '';

        // Замена последовательностей <br><br> на <br></br>
        containerHtml = containerHtml.replace(/(<br\s*\/?>\s*){2,}/g, '<br></br>');

        // Замена одиночных <br> на <br></br>
        containerHtml = containerHtml.replace(/<br\s*\/?>(?!<br\s*\/?>)/g, '<br></br>');

        lyricsHtml += containerHtml;
      });

      lyricsHtml += "<br></br>"

      if (lyricsHtml) {
        const apiPath: string = searchResponse.data.response.hits[0].result.api_path;

        const songColorResponse = await axios.get<SongColorResponse>(`https://api.genius.com${apiPath}`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        });

        color = songColorResponse.data.response.song.song_art_primary_color;
        textcolor = songColorResponse.data.response.song.song_art_text_color;
        second_color = songColorResponse.data.response.song.song_art_secondary_color;
      }

      return [lyricsHtml, color, second_color, textcolor];

    } else {
      console.log("Песня не найдена");
      return ["Песня не найдена", "#444", "#444", '#fff'];
    }
  } catch (error) {
    console.error('Ошибка при получении текста песни:', error);
    return ["Ошибка при получении текста песни", "#444", "#444", '#fff'];
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  const config = loadSettings();

  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: config.fullscreen ? undefined : 800,
    maxWidth: config.fullscreen ? undefined : 1280,
    minHeight: config.fullscreen ? undefined : 600,
    maxHeight: config.fullscreen ? undefined : 720,
    frame: !config.panelStyle,
    icon: path.join(process.env.VITE_PUBLIC, 'icon', 'linux', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../dist-electron', 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  Menu.setApplicationMenu(null);

  setInterval(() => {
    const userProfile: string = process.env.USERPROFILE || "";
    const exePath = path.join(userProfile, 'AppData', 'Roaming', 'Raoul', 'FindFuckingTitle', 'GiveMeFuckingTitle.exe');
    exec(`"${exePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }

      const title: string = Buffer.from(stdout, 'binary').toString('utf8').trim();

      if (songTitle !== title) {
        songTitle = title;
        console.log(`Spotify window title: ${title}`);
        if (songTitle !== "") {
          win?.webContents.send('spotify-task-title', title);
          getLyrics(title).then(([text, color, second_color, textcolor]) => {
            win?.webContents.send('spotify-task-lyrics', text);
            win?.webContents.send('spotify-task-color', color);
            win?.webContents.send('spotify-task-second-color', second_color);
            win?.webContents.send('spotify-task-text-color', textcolor);
          })
        }
      }
    });
  }, 1000);

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
    const config = loadSettings();
    win?.webContents.send('spotify-task-settings', config);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(process.env.VITE_PUBLIC, 'icon', 'linux', 'icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => { win?.show(); } },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);

  tray.setToolTip('My Electron App');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win?.isVisible() ? win?.hide() : win?.show();
  });
});

ipcMain.on('save-settings', (_event: IpcMainEvent, newSettings: Settings) => {
  const config = loadSettings();
  if (config.fullscreen !== newSettings.fullscreen || config.panelStyle !== newSettings.panelStyle) {
    saveSettings(newSettings);
    app.relaunch();
    app.exit();
  }
  else {
    saveSettings(newSettings);
  }
});

ipcMain.on('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

ipcMain.on('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.isMaximized() ? window?.unmaximize() : window?.maximize();
});

ipcMain.on('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const config = loadSettings();
  config.hide ? window?.hide() : window?.close();
});
