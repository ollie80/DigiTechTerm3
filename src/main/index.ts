import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import fs from 'fs';
//import icon from '../../resources/icon.png?asset';
import path from 'path';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 360,
    height: 600,
    show: false,
    //...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,  // Enable context isolation
      sandbox: false
    }
  });

  mainWindow.menuBarVisible = false;

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  // Set app user model id for windows

  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('save-file', async (id, data) => {
  try {
    const savePath = join(app.getPath('appData'), 'trashtraders', 'saves', `${id}.json`);
    fs.writeFileSync(savePath, data, 'utf-8');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.handle('create-save', async (id) => {
  try {
    const savePath = join(app.getPath('appData'), 'trashtraders', 'saves', `${id}.json`);

    fs.mkdirSync(path.join(app.getPath('appData'), 'trashtraders', 'saves'), {recursive: true, mode: 0o755});

    console.log(fs.existsSync(savePath))

    const data = {
      money: 0,
      thermalReading: 0,
      gravityScale: 1
    };

    fs.writeFileSync(savePath, JSON.stringify(data), 'utf-8');

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.handle('load-file', async (id) => {
  try {
    const savePath = join(app.getPath('appData'), 'trashtraders', 'saves', `${id}.json`);
    if (fs.existsSync(savePath)) {
      const data = fs.readFileSync(savePath, 'utf-8');
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
