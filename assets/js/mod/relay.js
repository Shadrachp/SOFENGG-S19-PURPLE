/**
 * Simple communication between the main process and the renderer
 * processes.
 *
 * This is for the renderer process' side.
 *
 * mod_relay["Client" or "Log" or "Code" or "Lawyer"](
 *  String channel["new", "get", "delete"],
 *  ...
 * )
 * 
 *
 * @author Llyme
 * @dependencies nodeJS, viscount.js
**/
const mod_relay = {
	connected: false
};

{
	/* Hide it in this scope to prevent abuse. `sebastian.js` will
	   disable the `require` function.
	*/
	const {ipcRenderer} = require("electron");

	/**
	 * Wait until the database has connected. If it's already connected
	 * the `callback` will immediately be called.
	 *
	 * @param Function() callback - This function is called as soon as
	 * the message is received.
	**/
	mod_relay.waitForDatabase = callback => {
		let fn = (event, flag) => {
			if (!flag)
				return;

			ipcRenderer.removeListener("database_connected", callback);
			callback();
		};

		ipcRenderer.on("database_connected", fn);
	};

	/* List of models and their respective operations. To call them,
	   do something like `mod_relay.Client.new(..)(Function callback)`.
	   The first `()` is where you put the data you will be sending.
	   The second `()` is the `send` function containing the callback.
	*/
	const models = {
		Client: [
			/**
			 * Create a new client document.
			 *
			 * send():
			 * @param Object properties - properties necessary to make
			 * a new client document.
			 *
			 * callback():
			 * @param Boolean|null flag - successful if `true`,
			 * invalid if `false`, or error if `null`.
			**/
			"new",
			/**
			 * Update an existing document.
			 *
			 * send():
			 * @param String name - the name of the client that you
			 * want to edit.
			 * @param Object properties - the things you want to
			 * change.
			 *
			 * callback():
			 * @param Boolean|null flag - successful if `true`,
			 * invalid if `false`, or error if `null`.
			**/
			"edit",
			/**
			 * Grab some documents from the database.
			 *
			 * send():
			 * @param Integer skip - the first few documents in the
			 * query that you'll ignore and be not in the results.
			 * @param Integer limit - will return as much as this
			 * number or less. You can't get all of the documents at
			 * once, unless you know how many there are.
			 * @param Object query - will filter out the
			 * documents.
			 *
			 * callback():
			 * @param Array[Object]|null docs - the documents you
			 * specifically requested. `null` if nothing was found.
			**/
			"get"
		]
	}


	spook.waitForChildren(_ => {
		//-- Construct the operations for each model. --//
		for (let model in models) {
			mod_relay[model] = {};

			models[model].map(operation => {
				/* The channel for this request. Should be something
				   like `database_client_new`.
				*/
				const channel =
					"database_" +
					model.toLowerCase() + "_" +
					operation;

				mod_relay[model][operation] = function() {
					return callback => {
						let id = viscount();

						let fn = function(event, doc_id) {
							if (doc_id == id) {
								ipcRenderer.removeListener(
									channel,
									fn
								);
								viscount(id);

								let l = [];

								for (let i = 2;
									i < arguments.length;
									i++)
									l.push(arguments[i]);

								callback.apply(null, l);
							}
						};

						let l = [channel, id];

						for (let i = 0; i < arguments.length; i++)
							l.push(arguments[i]);

						ipcRenderer.on(channel, fn);
						ipcRenderer.send.apply(null, l);
					};
				};
			});
		}
	});


	//-- Check for database connection. --//

	mod_relay.waitForDatabase(_ => {
		mod_relay.connected = true;

		// Override `waitForDatabase` to direct.
		mod_relay.waitForDatabase = callback => callback();
	});

	ipcRenderer.send("database_connected");
};

spook.return();
