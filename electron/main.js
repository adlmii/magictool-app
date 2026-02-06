import { app, BrowserWindow, ipcMain, protocol, net, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { pathToFileURL, fileURLToPath } from 'url';

// ==========================================
// 1. SETUP ENVIRONMENT (WAJIB UTK VITE/ESM)
// ==========================================

// Membuat __dirname secara manual karena tidak ada di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tentukan Folder Temp (Tempat hasil gambar sementara disimpan)
const APP_TEMP_DIR = path.join(app.getPath('temp'), 'magictool_temp');

// ==========================================
// 2. WINDOW CREATION
// ==========================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Disable sementara agar mudah load gambar lokal
    },
    // Pastikan file icon.ico ada di folder public
    icon: path.join(__dirname, '../public/icon.ico'),
    autoHideMenuBar: true
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools(); // Buka Inspect Element otomatis di mode dev
  } else {
    // Load file HTML hasil build Vite
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// ==========================================
// 3. APP LIFECYCLE & PROTOCOL
// ==========================================

app.whenReady().then(() => {
  // Register Protocol "local-resource://" untuk menampilkan gambar dari disk
  protocol.handle('local-resource', (request) => {
    try {
      let url = request.url;
      let filePath = url.replace(/^local-resource:\/*/, '');
      filePath = decodeURI(filePath);

      // Fix untuk Windows: Hapus slash di depan drive letter (misal /C:/... jadi C:/...)
      if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(filePath)) {
        filePath = filePath.slice(1);
      }

      // Cek apakah file ada
      if (!fs.existsSync(filePath)) {
        return new Response('File not found', { status: 404 });
      }

      return net.fetch(pathToFileURL(filePath).toString());
    } catch (error) {
      console.error('⚠️ Protocol Error:', error);
      return new Response('Internal Error', { status: 500 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// 4. IPC HANDLERS (JEMBATAN FRONTEND-BACKEND)
// ==========================================

// Handler: Ambil path asli file yang diupload
ipcMain.handle('get-file-path', async (event, fileName) => {
  return fileName.path; 
});

// Handler: Simpan Gambar ke Komputer User
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

// Handler: PROCESS IMAGE (CORE LOGIC)
ipcMain.handle('process-image', async (event, args) => {
  return new Promise((resolve, reject) => {
    const { command, inputPath, targetFormat } = args;

    // 1. Buat folder temp jika belum ada
    if (!fs.existsSync(APP_TEMP_DIR)) fs.mkdirSync(APP_TEMP_DIR, { recursive: true });

    // 2. Siapkan Path Output
    const timestamp = Date.now();
    const ext = command === 'remove_bg' ? 'png' : (targetFormat || 'png');
    const outputFilename = `proc_${timestamp}.${ext}`;
    const outputPath = path.join(APP_TEMP_DIR, outputFilename);

    let executablePath;
    let finalArgs;

    // 3. Tentukan Mode: DEV (Python) atau PROD (EXE)
    if (app.isPackaged) {
      // --- MODE INSTALLER (.EXE) ---
      executablePath = path.join(process.resourcesPath, 'engine.exe');
      finalArgs = [command, inputPath, outputPath];
      
      // DIAGNOSA: Cek apakah engine.exe benar-benar ada?
      if (!fs.existsSync(executablePath)) {
        const msg = `FATAL ERROR: Engine tidak ditemukan di:\n${executablePath}\n\nFile engine.exe mungkin gagal tercopy saat build.`;
        dialog.showErrorBox("Engine Missing", msg);
        return reject({ success: false, log: msg });
      }
    } else {
      // --- MODE DEV (npm run app:dev) ---
      executablePath = 'python';
      const scriptPath = path.join(__dirname, '../python/main.py');
      finalArgs = [scriptPath, command, inputPath, outputPath];
    }

    if (targetFormat) finalArgs.push(targetFormat);

    // Logging untuk Debugging
    console.log(`🚀 Spawning: ${executablePath}`);
    console.log(`   Args: ${finalArgs}`);

    // 4. JALANKAN PROSES
    const pythonProcess = spawn(executablePath, finalArgs);
    let errorLog = '';

    // Tangkap error dari script Python/Engine
    pythonProcess.stderr.on('data', (data) => {
      errorLog += data.toString();
      console.error(`stderr: ${data}`);
    });

    // Tangkap error jika GAGAL START (Misal: Permission Denied / File Corrupt)
    pythonProcess.on('error', (err) => {
      const msg = `Gagal menjalankan Engine:\n${err.message}\nPath: ${executablePath}`;
      if (app.isPackaged) dialog.showErrorBox("Spawn Error", msg);
      reject({ success: false, log: msg });
    });

    // Tangkap saat proses SELESAI
    pythonProcess.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);

      // Cek 1: Code 0 artinya sukses secara perintah
      // Cek 2: File Output HARUS ADA. Kalau code 0 tapi file ga ada, berarti zonk.
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve({ success: true, outputPath });
      } else {
        // Analisa Error
        let msg = `Engine Error Code: ${code}`;
        if (code === 0 && !fs.existsSync(outputPath)) {
          msg = "Engine selesai, tapi file output tidak ditemukan (Silent Fail).";
        } else if (errorLog) {
          msg += `\nLog: ${errorLog}`;
        }

        // Tampilkan Popup Error hanya di aplikasi jadi (biar user tau)
        if (app.isPackaged) {
           dialog.showErrorBox("Process Failed", msg);
        }
        
        console.error(`❌ Process Error: ${msg}`);
        reject({ success: false, log: msg });
      }
    });
  });
});