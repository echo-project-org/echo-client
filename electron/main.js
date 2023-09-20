const { app, BrowserWindow, ipcMain, Tray, Menu, desktopCapturer } = require('electron')
const path = require('path')

var mainWindow;

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

let tray = null

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
  tray.on('double-click', function(e){
    mainWindow.show();
  })
  tray.setContextMenu(contextMenu)

  //WebRTC internals window
  
  if (!app.isPackaged) {
    var rtcInternals = new BrowserWindow({
      width: 1000,
      height: 700,
      title: "Echo",
      icon: 'images/icon',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true
      }
    })

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

ipcMain.handle("getVideoSources", async() => {
  return await desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 1280, height: 720 }, fetchWindowIcons: true });
})