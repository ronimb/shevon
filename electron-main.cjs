const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

const CHROME_H = 40;
const CALC_W = 504;
const CALC_H = 1000;
const HISTORY_EXTRA = 382;

let mainWindow = null;
let historyOpen = false;
let alwaysOnTop = false;
let bringAccel = null;

function createWindow() {
  const work = screen.getPrimaryDisplay().workAreaSize;
  const scale = Math.min(1, (work.height - CHROME_H) / CALC_H, work.width / CALC_W);
  const width = Math.max(320, Math.round(CALC_W * scale));
  const height = Math.max(360, Math.round(CHROME_H + CALC_H * scale));

  const win = new BrowserWindow({
    width,
    height,
    useContentSize: true,
    frame: false,
    resizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    title: 'Shevon',
    backgroundColor: '#121212',
    icon: path.join(__dirname, 'public/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.setMenuBarVisibility(false);
  mainWindow = win;
  historyOpen = false;

  const distPath = path.join(__dirname, 'dist', 'index.html');

  if (app.isPackaged) {
    win.loadFile(distPath);
  } else {
    win.loadURL('http://localhost:3000');
  }

  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
  });
}

function applyHistoryOpen(open) {
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;
  if (open === historyOpen) return;
  const bounds = win.getContentBounds();
  const work = screen.getPrimaryDisplay().workArea;
  if (open) {
    let { x, y, width, height } = bounds;
    width += HISTORY_EXTRA;
    if (x + width > work.x + work.width) {
      x = Math.max(work.x, work.x + work.width - width);
    }
    win.setContentBounds({ x, y, width, height });
    historyOpen = true;
  } else {
    win.setContentBounds({
      x: bounds.x,
      y: bounds.y,
      width: Math.max(320, bounds.width - HISTORY_EXTRA),
      height: bounds.height,
    });
    historyOpen = false;
  }
}

ipcMain.handle('shevon:setHistoryOpen', (_event, open) => {
  applyHistoryOpen(!!open);
});

ipcMain.handle('shevon:setAlwaysOnTop', (_event, on) => {
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;
  alwaysOnTop = !!on;
  win.setAlwaysOnTop(alwaysOnTop);
});

function toggleWindow() {
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;
  const up = win.isVisible() && !win.isMinimized();
  const inFront = win.isFocused() || alwaysOnTop;
  if (up && inFront) {
    win.hide();
    return;
  }
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function registerBringToFront(accel) {
  if (!accel || typeof accel !== 'string') return false;
  if (accel === bringAccel) return true;
  try {
    const ok = globalShortcut.register(accel, toggleWindow);
    if (!ok) return false;
    if (bringAccel) globalShortcut.unregister(bringAccel);
    bringAccel = accel;
    return true;
  } catch {
    return false;
  }
}

ipcMain.handle('shevon:setBringToFrontAccelerator', (_event, accel) => {
  return registerBringToFront(accel);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
