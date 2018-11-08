/**
 * Simple communication between the main process and the renderer
 * processes.
 *
 * This is for the main process' side.
 *
 * @author Llyme
**/
const {ipcMain, BrowserWindow} = require("electron");
const crypto = require("crypto");
const spook = require("../spook.js");
const database = require("./database.js");




//-- Some channels. --//

/**
 * Check if the database is connected.
**/
ipcMain.on("database_connected", event => {
	event.sender.send("database_connected", database.connected);
});

/**
 * THE DOCUMENTATION IS AT THE RENDERER-SIDE `mod/relay.js`. GO THERE.
 *
 *
 * Conditional statements when attempting to manipulate the documents.
 * These function as constraints.
 *
 * Pre-defined arguments (starting from the left):
 *
 * @param EventEmitter event - most of the conversation is in here.
 *
 * @param Integer id - unique number for each conversation between the
 * the main process and the renderer process. The uniqueness is only
 * within that specific renderer process, not the main process.
 *
 * @param String channel - the channel used for the conversation.
 * Unlike the rest of the pre-defined arguments, this is ALWAYS found
 * at the right-most of the arguments for each function.
 *
 *
 * THE DOCUMENTATION IS AT THE RENDERER-SIDE `mod/relay.js`. GO THERE.
*/
let filter = {
	User: {
		new: (event, id, properties, channel) => {
			spook.models.User.findOne({
				username: properties.username
			}).then(doc => {
				if (!doc) {
					properties.password =
						crypto.createHash("sha256")
						.update(properties.password).digest("hex");

					spook.models.User.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc ? true : false
						)
					);
				} else
					event.sender.send(channel, id, false);
			});
		},
		get: (event, id, username, password, channel) => {
			spook.models.User.findOne({
				username
			}).then(doc =>
				event.sender.send(
					channel,
					id,
					doc ? (
						doc.password == crypto.createHash("sha256")
						.update(password).digest("hex") ?
						2 : // Correct username and password.
						1 // Incorrect password.
					) : 0 // No such username.
				)
			);
		}
	},
	Client: {
		new: (event, id, properties, channel) =>
			spook.models.Client.findOne({name: properties.name})
			.then(doc => {
				if (!doc)
					spook.models.Client.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc ? true : false
						)
					);
				else
					event.sender.send(channel, id, false);
			}),
		edit: (event, id, name, properties, channel) => {
			spook.models.Client.findOne({name: name}).then(doc => {
				if (doc) {
					doc.set(properties);
					doc.save((err, doc) => event.sender.send(
						channel,
						id,
						err ? false : true
					));
				} else
					event.sender.send(channel, id, false);
			});
		},
		get: (event, id, skip, limit, channel) => {
			spook.models.Client.aggregate([{
				// We only need the name.
				$project: {
					_id: 0,
					name: 1
				}
			}, {
				// Make an uppercased version.
				$addFields: {
					key: {$toUpper: "$name"}
				}
			}, {
				// Sort by uppercased version.
				$sort: {
					key: 1
				}
			}, {
				// Skip stuff.
				$skip: skip != null ? (skip < 0 ? 0 : skip) : 0
			}, {
				// Limit results (excluding skipped stuff).
				$limit: limit ? (limit <= 0 ? 1 : limit) : 1
			}]).then(docs =>
				event.sender.send(channel, id, docs)
			);
		}
	}
};

for (let model in filter) {
	for (let operation in filter[model]) {
		let channel =
			"database_" + model.toLowerCase() + "_" + operation;
		let fn = filter[model][operation];

		ipcMain.on(channel, function(event, id) {
			// Return nothing if incomplete arguments.
			if (arguments.length + 1 < fn.length)
				return event.sender.send(channel, id);

			arguments[arguments.length] = channel;
			arguments.length++;

			fn.apply(null, arguments);
		});
	}
}




//-- Melee Initialization --//

module.exports = true;
