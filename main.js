const {app, BrowserWindow, session} = require("electron");
const url = require('url');
const path = require('path');

function init() {
	// Clear up cache to prevent bloating.
	session.defaultSession.clearStorageData();
	session.defaultSession.clearCache(_ => _);
	session.defaultSession.clearHostResolverCache();

	//Create a new window
	let win = new BrowserWindow({
		title: "A Very Nice Title" // You can set the title here as well.
	});

	// This will disable the menu bar, though it gets disabled automatically
	// in deployment anyway.
	// win.setMenu(null);

	//Load view into the window
	win.loadFile("assets/html/root.html");

	// We need the menu bar for testing. We'll use this later.
	// setMenu(menu);

	// This will unassign the object and be garbage-collected.
	win.on("closed", () => win = null);
}

/**
 * Replaces the current menu bar of the app 
 * @param menu - an array of dropdown menus
**/
function setMenu(menuBar){
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
};

// Creates the menu bar which contains an array of dropdown menus.
const menu = [
    {
        label: 'Settings'
    },
];

// Listen for app to be ready.
app.on("ready", init);

/* This will allow the app to shutdown properly.
   Electron can make background processes and
   can possibly prevent the app to close.
*/
app.on("window-all-closed", _ =>
	process.platform !== "darwin" && app.quit()
);

// The 'ready' event for MacOS.
app.on("activate", init);
