const {ipcMain, app, BrowserWindow, session} = require("electron");

const spook = require("./assets/js/spook.js"); // The spooky framework.



//-- Setup Electron Main Process --//

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
		title: "Uy's Law Firm" // You can set the title here too.
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

if (!app.requestSingleInstanceLock())
	// Close this app if there's already an open instance.
	app.quit();
else {
	app.on("second-instance", _ => {
		let l = BrowserWindow.getAllWindows();

		// Check if there's at least 1 existing window.
		if (l.length) {
			// Show the first one to the user.
			if (l[0].isMinimized())
				l[0].restore();

			l[0].focus();
		}
	});

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




	//-- Melee Initialization --//

	// Wait for all the children (AKA modules) to load.
	spook.waitForChildren(_ => {
		spook.database.connect("mongodb://localhost:27017/UysLawFirm",
			renew => {
				if (renew)
					spook.models.User.new({
						username: "admin",
						password: require("crypto").createHash("sha256")
							.update("1234").digest("hex")
					}, _ => _);

				// Broadcast that we have connected to the database.
				BrowserWindow.getAllWindows().map(v =>
					v.webContents.send("database_connected", true)
				);
			}
		);
	});
}