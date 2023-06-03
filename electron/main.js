const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('path')

var mainWindow;

const createMainWindow = () => {
  var win = new BrowserWindow({
    width: 1000,
    height: 600,
    title: "Echo",
    frame: false,
    icon: 'images/echoIcon',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  })

  win.setMinimumSize(800, 500);

  if (app.isPackaged) {
    win.loadFile('index.html'); // prod
  } else {
    win.loadURL('http://localhost:3000'); // dev
  }

  return win;
}

let tray = null

app.whenReady().then(() => {
  mainWindow = createMainWindow()
  tray = new Tray(path.join(__dirname, 'images','echoIcon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Echo",
      enabled: false
    },
    {
      type: 'separator',
    },
    {
      label: "Show app",
      click: function () {
        mainWindow.show();
      }
    },
    {
      label: "Close app",
      click: function () {
        mainWindow.close();
      }
    },
  ])
  tray.setToolTip('Echo')
  tray.setContextMenu(contextMenu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

ipcMain.on("exitApplication", (event, arg) => {
  app.quit();
})

ipcMain.on("minimize", (event, arg) => {
  mainWindow.minimize();
})

ipcMain.on("toggleFullscreen", (event, arg) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
})