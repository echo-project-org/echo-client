const { app, BrowserWindow, ipcMain, Tray, Menu, desktopCapturer, autoUpdater, dialog } = require('electron')
const path = require('path')

const server = 'https://download.kuricki.com'
const url = `${server}/update/${process.platform}/${app.getVersion()}`
autoUpdater.setFeedURL({ url })
autoUpdater.checkForUpdates();

setInterval(() => {
  console.log("Checking for updates")
  console.log(url);
  autoUpdater.checkForUpdates()
}, 60000)

autoUpdater.on('update-available', () => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart and update'],
    title: 'Echo update',
    message: 'New version available',
    detail: 'A new version of Echo is available. Please update the app.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    autoUpdater.quitAndInstall();
  })
})

autoUpdater.on('update-not-available', () => {
  console.log("No updates available")
})

autoUpdater.on('error', (message) => {
  console.error("Error while checking for updates")
  console.error(message)
})
var mainWindow;
var rtcInternals;

const createRtcInternalsWindow = () => {
  var rtcInternals = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Echo",
    icon: 'images/icon',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      devTools: false
    }
  })

  rtcInternals.loadURL("chrome://webrtc-internals");
  return rtcInternals;
}

const createMainWindow = () => {
  var win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Echo",
    frame: false,
    icon: 'images/icon',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true
    }
  })

  win.setMinimumSize(800, 700);

  if (app.isPackaged) {
    win.loadFile('index.html'); // prod
  } else {
    win.loadURL('http://localhost:3000'); // dev
  }
  /*
    win.setThumbarButtons([
      {
        tooltip: 'Mute microphone',
        icon: path.join(__dirname, 'images', 'mic.png'),
        click: function() { console.log('button1 clicked') }
      }, {
        tooltip: 'Deafen audio',
        icon: path.join(__dirname, 'images', 'mic.png'),
        click: function() { console.log('button2 clicked.') }
      }
    ])*/

  return win;
}

let tray = null;


app.whenReady().then(() => {
  mainWindow = createMainWindow()
  tray = new Tray(path.join(process.cwd(), 'images', 'icon.png'))
  const TrayMenu = [
    {
      label: "Echo",
      enabled: false
    },
    {
      type: 'separator',
    },
    {
      label: "Open app",
      click: function () {
        mainWindow.show();
      }
    },
    {
      label: "Check for update",
      click: function () {
      }
    },
    {
      type: 'separator',
    },
    {
      label: "Quit echo",
      click: function () {
        // mainWindow.close();
        app.quit();
      }
    },
  ]

  if (!app.isPackaged) {
    TrayMenu.splice(2, 0, {
      label: "Open rtc-internals",
      click: function () {
        if (rtcInternals.isDestroyed()) {
          rtcInternals = createRtcInternalsWindow();
        }

        rtcInternals.show();
      }
    })

    TrayMenu.splice(3, 0, {
      label: "Open dev tools",
      click: function () {
        mainWindow.webContents.openDevTools();
      }
    })
  }

  const contextMenu = Menu.buildFromTemplate(TrayMenu);
  tray.setToolTip('Echo')
  tray.on('double-click', function (e) {
    mainWindow.show();
  })
  tray.setContextMenu(contextMenu)

  //WebRTC internals window

  if (!app.isPackaged) {
    if (!rtcInternals) {
      rtcInternals = createRtcInternalsWindow();
    }

    // open dev tools
    mainWindow.webContents.openDevTools();
    // open rtc internals for degugging
    rtcInternals.loadURL("chrome://webrtc-internals");
    rtcInternals.show();
  }
})

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

ipcMain.on("exitApplication", (event, arg) => {
  if (!app.isPackaged) {
    if (!rtcInternals.isDestroyed()) {
      rtcInternals.close();
    }
  }

  if (!mainWindow.isDestroyed()) {
    mainWindow.close();
  }
  
  app.quit();
  // TODO: option that hides the app to tray instead of closing it
  // if (tray) {
  //   return mainWindow.hide();
  // }
})

ipcMain.on("minimize", (event, arg) => {
  return mainWindow.minimize();
})

ipcMain.on("toggleFullscreen", (event, arg) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
})

ipcMain.handle("getVideoSources", async () => {
  return await desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 1280, height: 720 }, fetchWindowIcons: true });
})