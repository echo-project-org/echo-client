const { app, BrowserWindow } = require('electron')

const createMainWindow = () => {
    const win = new BrowserWindow({
      width: 1000,
      height: 600
    })

    win.setMinimumSize(800, 500);

    win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
    createMainWindow()
})