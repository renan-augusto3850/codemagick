const {app, BrowserWindow, Menu, ipcMain, dialog} = require("electron");
const fs = require('fs');
const path = require("path");

var win;
var filepath;
function genWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: './SeaHorseIcon.ico',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.resolve('./process.js'),
            //devTools: false
        }
    });
    win.loadFile('index.html');
    win.webContents.openDevTools();
}
app.whenReady().then(() => {
    genWindow();
    const menuTemplate = [
        {
          label: 'File',
          submenu: [
            {
              label: 'Open File',
              accelerator: 'CmdOrCtrl+O',
              click() {
                dialog.showOpenDialog({
                  properties: ['openFile']
                }).then(result => {
                  if (!result.canceled) {
                    fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
                      if (err) {
                        return;
                      }
                      filepath = result.filePaths[0];
                      win.webContents.send('file-data', data);
                    });
                  }
                }).catch(err => {
                  console.error(err);
                });
              }
            }
          ]
        }
      ];
    
      const menu = Menu.buildFromTemplate(menuTemplate);
      Menu.setApplicationMenu(menu);
});
ipcMain.on('content-to-save', (event, content) => {
  fs.writeFileSync(filepath, content);
});
ipcMain.on('close', (event, content) => {
  app.quit();
});
ipcMain.on('minimize', (event, content) => {
  win.minimize();
});
ipcMain.on('maximize', (event, content) => {
  win.maximize();
});
ipcMain.on('content-to-open', (event, content) => {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled) {
      fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
        if (err) {
          return;
        }
        filepath = result.filePaths[0];
        win.webContents.send('file-data', data);
      });
    } 
  });
});