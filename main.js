const {app, BrowserWindow, session} = require("electron");
const url = require("url");
const path = require("path");
const crypto = require("crypto");

function init() {
	// Clear up cache to prevent bloating.
	session.defaultSession.clearStorageData();
	session.defaultSession.clearCache(_ => _);
	session.defaultSession.clearHostResolverCache();

	// Create a new window.
	let win = new BrowserWindow({
		width: 800,
		height: 640,
		minWidth: 800,
		minHeight: 640,
		title: "A Very Nice Title" // You can set the title here too.
	});

	// Load view into the window.
	win.loadFile("assets/html/index.html");

	// We need the menu bar for testing. We'll use this later.
	// This will disable the menu bar, though it gets disabled
	// automatically in deployment anyway.
	// setMenu(menu);
	//win.setMenu(null);

	// This will unassign the object and be garbage-collected.
	win.on("closed", _ => win = null);
}

/**
 * Replaces the current menu bar of the app 
 * @param menu - an array of dropdown menus
**/
function setMenu(menuBar) {
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
