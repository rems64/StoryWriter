const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')

var settings = 
{
  language: "FR-fr"
}

var locals = 
{
  "fileNew": "Nouveau",
  "fileOpen": "Ouvrir",
  "fileSave": "Enregistrer",
  "fileSaveAs": "Enregistrer sous",
  //"errorMsg": "An error occured during saving process, please report",
  "errorMsg": "Une erreur est survenue durant le processus, merci de le signaler",
  "infoMsg": "<i class='fas fa-info-circle fa-2x'></i> "
}

ipcMain.on("getLocals", (event, arg) => {
  event.reply("sendLocals", {
    locals: locals
  })
})

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
            {
              label:locals.fileNew,
              click() {
                console.log("NEW");
                win.webContents.send("new");
              },
              accelerator: "CmdOrCtrl+N"
            },
            {
              label:locals.fileOpen,
              click() {
                //win.webContents.send("open");
                
                console.log("OPEN");
                dialog.showOpenDialog({
                  properties: ['openFile']
                }).then(result => {
                  console.log("SAVE AS");
                  console.log(result);
                  win.webContents.send("open", result)
                })
                
              },
              accelerator: "CmdOrCtrl+O",
            },
            {
              label:locals.fileSave,
              click() {
                console.log("SAVE")
                win.webContents.send("save")
              },
              accelerator: "CmdOrCtrl+S"
            },
            {
              label:locals.fileSaveAs,
              click() {
                dialog.showSaveDialog({
                  properties: ['openFile', 'multiSelections']
                }).then(result => {
                  if(!result.canceled)
                  {
                    console.log("SAVE AS");
                    console.log(result);
                    win.webContents.send("saveas", result);
                  }
                })
              },
              accelerator: "CmdOrCtrl+Alt+S"
            }
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