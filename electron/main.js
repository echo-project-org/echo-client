const { app, BrowserWindow, ipcMain, Tray, Menu, desktopCapturer, dialog } = require('electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const path = require('path')

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

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
    win.loadFile('./frontend/index.html'); // prod
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
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = createMainWindow()
  if(app.isPackaged) {
    tray = new Tray(path.join(process.cwd(), "resources", 'images', 'icon.png'))
  } else {
    tray = new Tray(path.join(process.cwd(), 'images', 'icon.png'))
  }
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
        autoUpdater.removeAllListeners("update-not-available");
        autoUpdater.on('update-not-available', () => {
          dialog.showMessageBox({type: 'info', title: 'Echo', message: 'No updates available', buttons: ["OK"]});
        });
        //check for updates
        autoUpdater.checkForUpdatesAndNotify();
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
        if (!rtcInternals || rtcInternals.isDestroyed()) {
          rtcInternals = createRtcInternalsWindow();
        }

        rtcInternals.loadURL("chrome://webrtc-internals");
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

  if (!app.isPackaged) {
    // open dev tools
    mainWindow.webContents.openDevTools();
  }
})

autoUpdater.on('update-available', (info) => {
  if(mainWindow) {
    //hide the main window
    mainWindow.webContents.send("updateAvailable", {"version": info.version, "releaseNotes": info.releaseNotes});
    mainWindow.setProgressBar(0);
  }
});

autoUpdater.on('download-progress', (e) => {
  if(mainWindow) {
    //hide the main window
    mainWindow.webContents.send("downloadProgress", {"percent": e.percent, "bps": e.bytesPerSecond});
    mainWindow.setProgressBar(e.percent / 100);
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBoxSync({
    type: 'info',
    title: 'Echo',
    message: 'Update downloaded. Restarting...',
    buttons: ["OK"]
  });

  autoUpdater.quitAndInstall(true, true);
});

autoUpdater.on('error', (err) => {
  dialog.showErrorBox('Error downloading update: ', err == null ? "unknown" : (err.stack || err).toString());
});

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