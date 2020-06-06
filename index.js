const { app, BrowserWindow, Menu } = require('electron')

var settings = 
{
  language: "FR-fr"
}

var locals = 
{
  fileNew: "Nouveau",
  fileOpen: "Ouvrir",
  fileSave: "Enregistrer",
  fileSaveAs: "Enregistrer sous"
}

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
  //win.removeMenu()

  var menu = Menu.buildFromTemplate([
    {
        label: 'Fichier',
        submenu: [
            {label:locals.fileNew},
            {label:locals.fileOpen},
            {label:locals.fileSave},
            {label:locals.fileSaveAs}
        ]
      },
      {
        label: 'Dev',
        submenu: [
          {label:'Devtools', click(){win.webContents.openDevTools()},accelerator: 'CmdOrCtrl+Shift+I'}
      ]
    }
  ])
  Menu.setApplicationMenu(menu); 

}

function loadSettings()
{

}

app.whenReady().then(createWindow)