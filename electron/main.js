const { app, BrowserWindow, ipcMain } = require('electron')

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
        contextIsolation: false
      }
    })

    win.setMinimumSize(800, 500);

    if(app.isPackaged) {
      win.loadFile('index.html'); // prod
    }else{
      win.loadURL('http://localhost:3000'); // dev
    }

    return win;
}


app.whenReady().then(() => {
  mainWindow = createMainWindow()
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
  if(mainWindow.isMaximized()){
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
})