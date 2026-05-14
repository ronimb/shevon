const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 850,
    resizable: true,
    autoHideMenuBar: true,
    title: "Scientific Calculator Emulator",
    icon: path.join(__dirname, 'public/icons/icon.png'), // Will fallback if missing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In production, we load the bundled index.html
  // path.join(__dirname, 'dist/index.html')
  const distPath = path.join(__dirname, 'dist', 'index.html');
  
  if (app.isPackaged) {
    win.loadFile(distPath);
  } else {
    // Development
    win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
