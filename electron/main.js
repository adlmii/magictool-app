import { app, BrowserWindow, ipcMain, protocol, net, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { pathToFileURL, fileURLToPath } from 'url';

// ==========================================
// SETUP ENVIRONMENT
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let APP_TEMP_DIR;
let mainWindow;
let splashWindow;

// ==========================================
// WINDOW CREATION
// ==========================================

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 360,
    height: 260,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    show: true,
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    center: true,

    frame: false,
    autoHideMenuBar: true,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: process.env.NODE_ENV === 'development' ? false : true
    },

    icon: path.join(__dirname, '../public/icon.ico'),
  });

  if (process.env.NODE_ENV === 'development') {
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  // mainWindow.webContents.openDevTools();
}

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) splashWindow.close();
    mainWindow.show();
  });
}

// ==========================================
// APP LIFECYCLE & PROTOCOL
// ==========================================

app.whenReady().then(() => {
  APP_TEMP_DIR = path.join(app.getPath('temp'), 'magictool_temp');

  // Register protocol local-resource://
  protocol.handle('local-resource', (request) => {
    try {
      let url = request.url;
      let filePath = url.replace(/^local-resource:\/*/, '');
      filePath = decodeURI(filePath);

      if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(filePath)) {
        filePath = filePath.slice(1);
      }

      if (!fs.existsSync(filePath)) {
        return new Response('File not found', { status: 404 });
      }

      return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
      console.error('⚠️ Protocol Error:', error);
      return new Response('Internal Error', { status: 500 });
    }
  });

  createSplashWindow();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// IPC HANDLERS
// ==========================================

// Ambil path file asli
ipcMain.handle('get-file-path', async (event, file) => {
  return file.path;
});

// Simpan file hasil
ipcMain.handle('save-image', async (event, { tempPath, defaultName }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Simpan Gambar',
    defaultPath: defaultName,
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'ico'] }]
  });

  if (canceled || !filePath) return { success: false };

  try {
    fs.copyFileSync(tempPath, filePath);
    return { success: true, savedPath: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Window controls
ipcMain.handle('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.handle('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
});

ipcMain.handle('window-close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

// ==========================================
// IMAGE PROCESSING CORE
// ==========================================

ipcMain.handle('process-image', async (event, args) => {
  return new Promise((resolve, reject) => {
    const { command, inputPath, targetFormat, scale, keepSize } = args;

    if (!fs.existsSync(APP_TEMP_DIR)) {
      fs.mkdirSync(APP_TEMP_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = command === 'remove_bg' ? 'png' : (targetFormat || 'png');
    const outputFilename = `proc_${timestamp}.${ext}`;
    const outputPath = path.join(APP_TEMP_DIR, outputFilename);

    let executablePath;
    let finalArgs;

    if (app.isPackaged) {
      executablePath = path.join(process.resourcesPath, 'engine.exe');
      finalArgs = [command, inputPath, outputPath];
    } else {
      executablePath = 'python';
      const scriptPath = path.join(__dirname, '../python/main.py');
      finalArgs = [scriptPath, command, inputPath, outputPath];
    }

    if (scale) {
        finalArgs.push('--scale');
        finalArgs.push(scale.toString());
    }

    if (keepSize) {
        finalArgs.push('--keep_original');
    }

    console.log(`🚀 Spawning: ${executablePath}`);
    console.log(`   Args: ${finalArgs}`);

    const pythonProcess = spawn(executablePath, finalArgs, { windowsHide: true });
    let errorLog = '';

    pythonProcess.stderr.on('data', (data) => {
      errorLog += data.toString();
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('error', (err) => {
      const msg = `Gagal menjalankan Engine:\n${err.message}`;
      if (app.isPackaged) dialog.showErrorBox("Spawn Error", msg);
      reject({ success: false, log: msg });
    });

    pythonProcess.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);

      if (code === 0 && fs.existsSync(outputPath)) {
        resolve({ success: true, outputPath });
      } else {
        let msg = `Engine Error Code: ${code}`;
        if (errorLog) msg += `\n${errorLog}`;

        if (app.isPackaged) {
          dialog.showErrorBox("Process Failed", msg);
        }

        reject({ success: false, log: msg });
      }
    });
  });
});