const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

let mainWindow;

//Listen for app to be ready
app.on('ready', ()=>{
    
    //Create a new window
    mainWindow = new BrowserWindow({});
    
    //Load view into the window
    mainWindow.loadURL(url.format({
        pathname: './views/layouts/main.html',
        protocol: 'file',
        slashes: true,
    }))
    setMenu(menu);
});

/*
* Replaces the current menu bar of the app 
* @param menu - an array of dropdown menus
*/

function setMenu(menuBar){
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
};

//creates the menu bar which contains an array of dropdown menus
const menu = [
    {
        label: 'Settings'
    },
];