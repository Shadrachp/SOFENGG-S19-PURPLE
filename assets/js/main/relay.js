/**
 * Simple communication between the main process and the renderer
 * processes.
 *
 * This is for the main process' side.
 *
 * @author Llyme
**/
const {ipcMain, BrowserWindow} = require("electron");
const mongoose = require("mongoose");
const crypto = require("crypto");
const spook = require("../spook.js");
const database = require("./database.js");
const ObjectId = mongoose.Types.ObjectId;

const conversation = {
	hash: Math.random().toString(),
	id: null
};




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
		new: (event, id, properties, channel) =>
			spook.models.User.findOne({
				username: new RegExp("^" + properties.username + "$", "i")
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
			}),

		get: (event, id, username, password, channel) =>
			spook.models.User.findOne({
				username
			}).then(doc => {
				if (doc) {
					// Make a conversation ID.
					conversation.hash = crypto.createHash("sha256")
						.update(conversation.hash)
						.digest("hex");
					conversation.id = doc._id;
				}

				event.sender.send(
					channel,
					id,
					doc ? (
						doc.password == crypto.createHash("sha256")
						.update(password).digest("hex") ?
						// Correct username and password. Return hash.
						conversation.hash :
						// Incorrect password.
						1
						// No such username.
					) : 0
				);
			})
	},

	Client: {
		new: (event, id, properties, channel) => {
			if (!properties.hasOwnProperty("user") ||
				properties.user != conversation.hash)
				return event.sender.send(channel, id);

			spook.models.Client.findOne({
				user: conversation.id,
				name: new RegExp("^" + properties.name + "$", "i")
			}).then(doc => {
				if (!doc) {
					properties.user = conversation.id;

					spook.models.Client.new(properties, doc =>
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

		edit: (event, id, hash, name, properties, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Client.findOne({
				user: conversation.id,
				name: new RegExp(name, "i")
			}).then(doc => {
				if (doc) {
					doc.set(properties);
					doc.save((err, doc) =>
						event.sender.send(
							channel,
							id,
							err ? false : true
						)
					);
				} else
					event.sender.send(channel, id, false);
			});
		},

		get: (event, id, hash, skip, limit, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Client.aggregate([{
				$match: {
					user: conversation.id
				}
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					name: 1,
					time: 1,
					log_count: 1
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
		},

		getOne: (event, id, hash, key, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Client.findOne({
				user: conversation.id,
				name: new RegExp("^" + key + "$", "i")
			}).then(doc =>
				event.sender.send(
					channel,
					id,
					doc && {
						_id: doc._id.toString(),
						name: doc.name,
						time: doc.time,
						logs_count: doc.logs_count
					}
				)
			);
		}
	},

	Log: {
		new: (event, id, properties, channel) => {
			properties._id = new ObjectId(properties._id);

			spook.models.Log.new(properties, doc =>
				event.sender.send(
					channel,
					id,
					doc && doc._id.toString()
				)
			)
		},

		edit: (event, id, _id, properties, channel) =>
			spook.models.Log.findOne({_id: _id}).then(doc => {
				if (doc) {
					doc.set(properties);
					doc.save((err, doc) => event.sender.send(
						channel,
						id,
						err ? false : true
					));
				} else
					event.sender.send(channel, id, false);
			}),

		get: (event, id, client_id, skip, limit, channel) =>
			spook.models.Log.aggregate([{
				$match: {
					client: new ObjectId(client_id)
				}
			}, {
				$lookup: {
					from: "lawyers",
					localField: "lawyer",
					foreignField: "_id",
					as: "lawyer"
				}
			}, {
				$unwind: "$lawyer"
			}, {
				$unwind: "$codes"
			}, {
				$lookup: {
					from: "codes",
					localField: "codes",
					foreignField: "_id",
					as: "codes"
				}
			}, {
				$unwind: "$codes"
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					date: 1,
					time_start: 1,
					time_end: 1,
					lawyer: {
						_id: {
							$toString: "$lawyer._id"
						},
						name: 1
					},
					codes: {
						_id: {
							$toString: "$codes._id"
						},
						code: 1,
						description: 1
					},
					description: 1
				}
			}, {
				$group: {
					_id: "$_id",
					date: {
						$first: "$date"
					},
					time_start: {
						$first: "$time_start"
					},
					time_end: {
						$first: "$time_end"
					},
					lawyer: {
						$first: "$lawyer"
					},
					codes: {
						$push: "$codes"
					},
					description: {
						$first: "$description"
					}
				}
			}, {
				$sort: {
					_id: -1
				}
			}, {
				$skip: skip != null ? (skip < 0 ? 0 : skip) : 0
			}, {
				$limit: limit ? (limit <= 0 ? 1 : limit) : 1
			}]).then(docs =>
				event.sender.send(channel, id, docs)
			)
	},

	Lawyer: {
		new: (event, id, properties, channel) => {
			if (!properties.hasOwnProperty("user") ||
				properties.user != conversation.hash)
				return event.sender.send(channel, id);

			spook.models.Lawyer.findOne({
				user: conversation.id,
				name: new RegExp("^" + properties.name + "$", "i")
			}).then(doc => {
				if (!doc) {
					properties.user = conversation.id;

					spook.models.Lawyer.new(properties, doc =>
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

		edit: (event, id, hash, name, properties, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Lawyer.findOne({
				user: conversation.id,
				name
			}).then(doc => {
				if (doc) {
					doc.set(properties);
					doc.save((err, doc) =>
						event.sender.send(
							channel,
							id,
							err ? false : true
						)
					);
				} else
					event.sender.send(channel, id, false);
			});
		},

		get: (event, id, hash, skip, limit, filter, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Lawyer.aggregate([{
				$match: {
					user: conversation.id,
					name: new RegExp(filter, "i")
				}
			}, {
				// We only need the name.
				$project: {
					_id: {
						$toString: "$_id"
					},
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
		},

		getOne: (event, id, hash, key, channel) => {
			if (conversation.hash != hash)
				return event.sender.send(channel, id);

			spook.models.Lawyer.findOne({
				user: conversation.id,
				name: new RegExp("^" + key + "$", "i")
			}).then(doc =>
				event.sender.send(
					channel,
					id,
					doc && {
						_id: doc._id.toString(),
						name: doc.name
					}
				)
			);
		}
	},

	Code: {
		new: (event, id, properties, channel) =>
			spook.models.Code.findOne({code: properties.code})
			.then(doc => {
				if (!doc)
					spook.models.Code.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc ? true : false
						)
					);
				else
					event.sender.send(channel, id, false);
			}),

		edit: (event, id, code, properties, channel) =>
			spook.models.Code.findOne({code}).then(doc => {
				if (doc) {
					doc.set(properties);
					doc.save((err, doc) => event.sender.send(
						channel,
						id,
						err ? false : true
					));
				} else
					event.sender.send(channel, id, false);
			}),

		get: (event, id, skip, limit, filter, channel) =>
			spook.models.Code.aggregate([{
				$match: {
					$or: [
						{ code: new RegExp(filter, "i") },
						{ description: new RegExp(filter, "i") }
					]
				}
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					code: 1,
					description: 1
				}
			}, {
				$sort: {
					code: 1
				}
			}, {
				$skip: skip != null ? (skip < 0 ? 0 : skip) : 0
			}, {
				$limit: limit ? (limit <= 0 ? 1 : limit) : 1
			}]).then(docs =>
				event.sender.send(channel, id, docs)
			),

		getOne: (event, id, key, channel) => {
			key = new RegExp("^" + key + "$", "i");

			spook.models.Code.findOne({
				$or: [
					{ code: key },
					{ description: key }
				]
			}).then(doc =>
				event.sender.send(
					channel,
					id,
					doc && {
						_id: doc._id.toString(),
						code: doc.code,
						description: doc.description
					}
				)
			);
		}
	}
};

for (let model in filter) {
	for (let operation in filter[model]) {
		let channel = "database_" + model.toLowerCase() + "_" + operation;
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
