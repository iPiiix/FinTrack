const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const IS_DEV = process.env.NODE_ENV === 'development';

let mainWindow = null;
let nextServer = null;

// ── Database path: writable user-data folder ──────────────────────────────────
function getDbPath() {
  const userData = app.getPath('userData');
  if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
  return path.join(userData, 'fintrack.db');
}

// ── Wait until Next.js HTTP server is ready ───────────────────────────────────
function waitForServer(url, retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve();
        else if (n > 0) setTimeout(() => attempt(n - 1), 500);
        else reject(new Error('Server failed to start'));
      }).on('error', () => {
        if (n > 0) setTimeout(() => attempt(n - 1), 500);
        else reject(new Error('Server not reachable'));
      });
    };
    attempt(retries);
  });
}

// ── Start the Next.js standalone server ──────────────────────────────────────
function startNextServer() {
  // In production the standalone server is in extraResources/standalone/
  // In development Next.js is already running (started by concurrently)
  if (IS_DEV) return Promise.resolve();

  // process.resourcesPath = <app>/Contents/Resources  (outside the ASAR)
  const standaloneDir  = path.join(process.resourcesPath, 'standalone');
  const serverScript   = path.join(standaloneDir, 'server.js');

  if (!fs.existsSync(serverScript)) {
    throw new Error(`Next.js standalone build not found at:\n${serverScript}`);
  }

  const dbPath = getDbPath();

  nextServer = spawn(process.execPath, [serverScript], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      // Make Electron binary behave as plain Node.js
      ELECTRON_RUN_AS_NODE: '1',
      PORT:          String(PORT),
      NODE_ENV:      'production',
      DATABASE_PATH: dbPath,
      JWT_SECRET:    app.getPath('userData'),
      // Point to electron-builder's rebuilt native modules (correct ABI)
      NODE_PATH: path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules'),
    },
    stdio: 'pipe',
  });

  nextServer.stdout.on('data', (d) => process.stdout.write(d));
  nextServer.stderr.on('data', (d) => process.stderr.write(d));

  nextServer.on('exit', (code) => {
    if (code !== 0 && mainWindow) mainWindow.webContents.loadURL(`data:text/html,<h2>Server crashed (code ${code}). Restart FinTrack.</h2>`);
  });

  return waitForServer(`http://localhost:${PORT}`);
}

// ── Create the browser window ─────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    title: 'FinTrack',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // macOS traffic-light buttons
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#09090B',
  });

  mainWindow.loadURL(`http://localhost:${PORT}/api/auth/auto-local`);

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://localhost:${PORT}`)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    await startNextServer();
    createWindow();
  } catch (e) {
    console.error(e);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('before-quit', () => {
  if (nextServer) nextServer.kill();
});
