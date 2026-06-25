const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");

const PORT = 3000;
const IS_DEV = process.env.NODE_ENV === "development";

let mainWindow = null;
let nextServer = null;

// ── Database path: writable user-data folder ──────────────────────────────────
function getDbPath() {
  const userData = app.getPath("userData");
  if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
  return path.join(userData, "fintrack.db");
}

// ── Loading HTML shown while the server boots ─────────────────────────────────
function getLoadingHTML() {
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #09090B;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    .container { text-align: center; }
    .logo { font-size: 11px; letter-spacing: 4px; color: #71717A; margin-bottom: 32px; text-transform: uppercase; }
    .spinner {
      width: 32px; height: 32px;
      border: 2px solid #27272A;
      border-top-color: #E8FF47;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 24px;
    }
    .status { font-size: 13px; color: #52525B; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style></head><body>
    <div class="container">
      <div class="logo">FinTrack</div>
      <div class="spinner"></div>
      <div class="status">Iniciando sistema…</div>
    </div>
  </body></html>`;
}

// ── Wait until Next.js HTTP server is ready ───────────────────────────────────
function waitForServer(url, retries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      http
        .get(url, (res) => {
          if (res.statusCode < 500) resolve();
          else if (n > 0) setTimeout(() => attempt(n - 1), 500);
          else
            reject(new Error(`Server responded with status ${res.statusCode}`));
        })
        .on("error", () => {
          if (n > 0) setTimeout(() => attempt(n - 1), 500);
          else reject(new Error("Server not reachable after all retries"));
        });
    };
    attempt(retries);
  });
}

// ── Start the Next.js standalone server ──────────────────────────────────────
function startNextServer() {
  // In development Next.js is already running (started by concurrently)
  if (IS_DEV) return Promise.resolve();

  // process.resourcesPath = <app>/Contents/Resources  (outside the ASAR)
  const standaloneDir = path.join(process.resourcesPath, "standalone");
  const serverScript = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverScript)) {
    const msg = `Next.js standalone build not found at:\n${serverScript}\n\nThe app may not have been packaged correctly.`;
    dialog.showErrorBox("FinTrack — Error de arranque", msg);
    throw new Error(msg);
  }

  const dbPath = getDbPath();

  nextServer = spawn(process.execPath, [serverScript], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      // Make Electron binary behave as plain Node.js
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(PORT),
      NODE_ENV: "production",
      DATABASE_PATH: dbPath,
      JWT_SECRET: app.getPath("userData"),
      // Point to electron-builder's rebuilt native modules (correct ABI)
      NODE_PATH: path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "node_modules",
      ),
    },
    stdio: "pipe",
  });

  // Log server output for debugging
  let serverStderr = "";
  nextServer.stdout.on("data", (d) => process.stdout.write(d));
  nextServer.stderr.on("data", (d) => {
    process.stderr.write(d);
    serverStderr += d.toString();
  });

  nextServer.on("exit", (code) => {
    console.error(`[FinTrack] Next.js server exited with code ${code}`);
    if (code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
      const errorHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { background:#09090B; color:#fafafa; font-family:system-ui; display:flex; align-items:center; justify-content:center; height:100vh; }
        .c { text-align:center; max-width:500px; padding:24px; }
        h2 { color:#F87171; margin-bottom:16px; }
        p { color:#71717A; font-size:14px; line-height:1.6; margin-bottom:12px; }
        pre { background:#18181B; border:1px solid #27272A; padding:16px; border-radius:8px; font-size:11px; color:#A1A1AA; text-align:left; overflow:auto; max-height:200px; white-space:pre-wrap; }
        button { margin-top:16px; background:#E8FF47; color:#09090B; border:none; padding:10px 24px; border-radius:20px; font-weight:600; cursor:pointer; }
      </style></head><body>
        <div class="c">
          <h2>Error del servidor (código ${code})</h2>
          <p>El servidor interno de FinTrack se ha detenido inesperadamente.</p>
          <pre>${serverStderr.slice(-500).replace(/</g, "&lt;")}</pre>
          <button onclick="location.reload()">Reintentar</button>
        </div>
      </body></html>`;
      mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`,
      );
    }
  });

  return waitForServer(`http://localhost:${PORT}`);
}

// ── Create the browser window ─────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "FinTrack",
    show: false,
    icon: path.join(
      IS_DEV ? __dirname : process.resourcesPath,
      "..",
      "public",
      "png.png",
    ),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // macOS traffic-light buttons
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#09090B",
  });

  // Show loading screen immediately
  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getLoadingHTML())}`,
  );
  mainWindow.show();

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://localhost:${PORT}`)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Detect navigation failures to prevent permanent black screen
  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `[FinTrack] Failed to load: ${validatedURL} — ${errorDescription} (${errorCode})`,
      );
      if (validatedURL.includes("localhost")) {
        // Server might not be ready yet, retry after a delay
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(`http://localhost:${PORT}/api/auth/auto-local`);
          }
        }, 2000);
      }
    },
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    createWindow();
    await startNextServer();
    // Server is ready — navigate to the app
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`http://localhost:${PORT}/api/auth/auto-local`);
    }
  } catch (e) {
    console.error("[FinTrack] Startup error:", e);
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showErrorBox(
        "FinTrack — Error",
        `No se pudo iniciar FinTrack:\n\n${e.message}`,
      );
    }
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("before-quit", () => {
  if (nextServer) nextServer.kill();
});
