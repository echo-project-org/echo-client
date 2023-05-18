const { app, BrowserWindow } = require('electron')

const createMainWindow = () => {
    const win = new BrowserWindow({
      width: 1000,
      height: 600,
      title:"Echo",
      frame:true
    })

    win.setMinimumSize(800, 500);

    win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
    createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})