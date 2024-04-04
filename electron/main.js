const { clear } = require('console');
const { app, BrowserWindow, ipcMain, Tray, Menu, desktopCapturer, dialog, globalShortcut, session } = require('electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const path = require('path')

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

var mainWindow;
var rtcInternals;
var fakeDownloadInterval;
var fakeDownloadPercent = 0;
var fakeDownloadBps = 0;
const fakePatchNotes = "Fake release notes";

const muteThumbBtn = {
  tooltip: 'Mute microphone',
  icon: path.join(__dirname, 'images', 'unmute.png'),
  click() {
    mainWindow.webContents.send("toggleMute", true);
  }
}

const unmuteThumbBtn = {
  tooltip: 'Unmute microphone',
  icon: path.join(__dirname, 'images', 'mute.png'),
  click() {
    mainWindow.webContents.send("toggleMute", false);
  }
}

const deafenThumbBtn = {
  tooltip: 'Deafen audio',
  icon: path.join(__dirname, 'images', 'undeafen.png'),
  click() {
    mainWindow.webContents.send("toggleDeaf", true);
  }
}

const undeafenThumbBtn = {
  tooltip: 'Undeafen audio',
  icon: path.join(__dirname, 'images', 'deafen.png'),
  click() {
    mainWindow.webContents.send("toggleDeaf", false);
  }
}

var thumbBtns = [
  muteThumbBtn,
  deafenThumbBtn
]

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

  return win;
}

let tray = null;


app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = createMainWindow()

  //catch close event and send to renderer

  mainWindow.on('close', (e) => {
    if (mainWindow.isVisible()) {
      e.preventDefault();
      mainWindow.webContents.send("appClose");
      mainWindow.hide();
    }
  })

  if (app.isPackaged) {
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
          dialog.showMessageBox({ type: 'info', title: 'Echo', message: 'No updates available', buttons: ["OK"] });
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

    TrayMenu.splice(4, 0, {
      type: 'separator',
    });

    TrayMenu.splice(5, 0, {
      label: "Start fake update",
      click: function () {
        mainWindow.webContents.send("updateAvailable", { "version": "1.0.0", "releaseNotes": "Fake release notes" });
        clearInterval(fakeDownloadInterval);
        fakeDownloadInterval = setInterval(() => {
          fakeDownloadBps = Math.random() * 1000000;
          fakeDownloadPercent += 15;
          if (fakeDownloadPercent >= 100) {
            fakeDownloadPercent = 0;
          }

          mainWindow.setProgressBar(fakeDownloadPercent / 100);
          mainWindow.webContents.send("downloadProgress", {
            "progress": "idk what this is lol",
            "percent": fakeDownloadPercent,
            "bps": fakeDownloadBps,
            "totalToDownload": 1000000,
            "transferred": 1000000 * (fakeDownloadPercent / 100)
          });
        }, 1000);
      }
    })

    TrayMenu.splice(6, 0, {
      label: "Stop fake update",
      click: function () {
        if (fakeDownloadInterval) {
          clearInterval(fakeDownloadInterval);
          mainWindow.setProgressBar(-1);
          mainWindow.webContents.send("goToMainPage");
        }
      }
    })

    TrayMenu.splice(7, 0, {
      type: 'separator',
    });
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
  if (mainWindow) {
    //hide the main window
    mainWindow.webContents.send("updateAvailable", { "version": info.version, "releaseNotes": info.releaseNotes });
    mainWindow.setProgressBar(0);
  }
});

autoUpdater.on('download-progress', (e) => {
  if (mainWindow) {
    //hide the main window
    mainWindow.webContents.send("downloadProgress", {
      "progress": e.progress,
      "percent": e.percent,
      "bps": e.bytesPerSecond,
      "totalToDownload": e.total,
      "transferred": e.transferred
    });
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
    if (rtcInternals && !rtcInternals.isDestroyed()) {
      rtcInternals.close();
    }
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
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

//called with ipcRenderer.send("showThumbarButtons", true);
ipcMain.on("showThumbarButtons", (event, arg) => {
  if (mainWindow) {
    if (arg === true) {
      mainWindow.setThumbarButtons(thumbBtns);
    } else {
      mainWindow.setThumbarButtons([]);
    }
  }
})

ipcMain.on("updateThumbarButtons", (event, arg) => {
  if (arg.muted) {
    thumbBtns[0] = unmuteThumbBtn;
  } else {
    thumbBtns[0] = muteThumbBtn;
  }

  if (arg.deaf) {
    thumbBtns[1] = undeafenThumbBtn;
  } else {
    thumbBtns[1] = deafenThumbBtn;
  }

  if (mainWindow) {
    mainWindow.setThumbarButtons(thumbBtns);
  }
})

//register keyboard shortcuts
//example: arg = [{combination: "Ctrl+Shift+M", action: "toggleMute"}, {combination: "Ctrl+Shift+D", action: "toggleDeaf"}]
ipcMain.on("addKeyboardShortcut", (event, arg) => {
  foreach(arg, (shortcut) => {
    globalShortcut.register(shortcut.combination, () => {
      mainWindow.webContents.send(shortcut.action);
    })
  })
})

ipcMain.handle("getVideoSources", async () => {
  this.videoSources = await desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 1280, height: 720 }, fetchWindowIcons: true });
  return this.videoSources
})

ipcMain.on("grantDisplayMedia", (event, arg) => {
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    const selectedSource = this.videoSources.find(source => source.id === arg.id);

    callback({ video: selectedSource, audio: 'loopback' });
  })
});