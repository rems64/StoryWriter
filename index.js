const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Cree la fenetre du navigateur.
  let win = new BrowserWindow({
    width: 1240,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('./main.html')
  win.removeMenu()
}

app.whenReady().then(createWindow)