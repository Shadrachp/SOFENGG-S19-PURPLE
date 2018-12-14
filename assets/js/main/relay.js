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




//-- Some nice tools for decoding. --//

const regex_literals = [];
const regex_expressions = "\\.[](){}^|$+-*/?!,=:";

for (let i = 0; i < regex_expressions.length; i++) {
	let v = "\\" + regex_expressions[i];

	regex_literals.push([new RegExp(v, "g"), v])
}

function literalRegExp(str) {
	regex_literals.forEach(v => str = str.replace(v[0], v[1]));

	return str;
}




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
				username: new RegExp(
					"^" +
						literalRegExp(properties.username) +
						"$",
					"i"
				)
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
				event.sender.send(
					channel,
					id,
					doc ? (
						doc.password == crypto.createHash("sha256")
						.update(password).digest("hex") ?
						// Correct username and password. Return _id.
						doc._id.toString() :
						// Incorrect password.
						1
						// No such username.
					) : 0
				);
			})
	},

	Client: {
		new: (event, id, properties, channel) => {
			properties.user = new ObjectId(properties.user);

			spook.models.Client.findOne({
				user: properties.user,
				name: new RegExp(
					"^" +
						literalRegExp(properties.name) +
						"$",
					"i"
				)
			}).then(doc => {
				if (!doc)
					spook.models.Client.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc && doc._id.toString()
						)
					);
				else
					event.sender.send(channel, id);
			});
		},

		edit: (event, id, _id, properties, channel) =>
			spook.models.Client.findOne({
				_id: new ObjectId(_id)
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
			}),

		get: (event, id, user_id, skip, limit, filter, channel) => {
			let pipeline = [{
				$match: {
					user: new ObjectId(user_id)
				}
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					name: 1,
					time: 1,
					logs_count: 1
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
			}];

			if (filter)
				pipeline[0].$match.name =
					new RegExp(literalRegExp(filter), "i");

			spook.models.Client.aggregate(pipeline).then(docs =>
				event.sender.send(channel, id, docs)
			);
		},

		getOne: (event, id, user_id, key, channel) => {
			spook.models.Client.findOne({
				user: new ObjectId(user_id),
				name: new RegExp(
					"^" +
						literalRegExp(key) +
						"$",
					"i"
				)
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
		},

		delete: (event, id, _id, channel) => {
			let n = 3;
			let fn = _ => {
				n--;

				if (n)
					return;

				event.sender.send(channel, id, true);
			}

			_id = new ObjectId(_id);

			spook.models.Case.find({
				client: _id
			}).then(docs => {
				let query = {
					$in: docs.map(doc => doc._id)
				};

				spook.models.Case.deleteMany({_id: query})
				.exec()
				.then(fn);

				spook.models.Log.deleteMany({case: query})
				.exec()
				.then(fn);
			});

			spook.models.Client
			.deleteOne({_id})
			.exec()
			.then(res =>
				res.ok && res.n ?
				fn() : event.sender.send(channel, id, false)
			);
		}
	},

	Log: {
		new: (event, id, properties, channel) => {
			properties.case = new ObjectId(properties.case);
			properties.lawyer = new ObjectId(properties.lawyer);
			properties.codes.forEach((v, i) =>
				properties.codes[i] = new ObjectId(v)
			);

			spook.models.Log.new(properties, doc =>
				event.sender.send(
					channel,
					id,
					doc && doc._id.toString()
				)
			)
		},

		edit: (event, id, _id, properties, channel) =>
			spook.models.Log.findOne({
				_id: new ObjectId(_id)
			}).then(doc => {
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

		get: (event,
			  id,
			  case_id,
			  skip,
			  limit,
			  query,
			  sort,
			  channel) => {
			query = query || {};
			query.case = new ObjectId(case_id);

			spook.models.Log.aggregate([{
				$match: query
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					date: 1,
					time_start: 1,
					time_end: 1,
					lawyer: 1,
					codes: 1,
					description: 1,
					billed: 1
				}
			}, {
				$sort: sort
			}]).then(docs => {
				if (!docs.length)
					return event.sender.send(channel, id, []);

				let n0 = docs.length;
				let fn0 = _ => {
					n0--;

					if (n0)
						return;

					event.sender.send(channel, id, docs);
				};

				docs.forEach(doc => {
					let n1 = 2;
					let fn1 = _ => {
						n1--;

						if (n1)
							return;

						fn0();
					};

					spook.models.Lawyer.findOne({
						_id: doc.lawyer
					}).then(lawyer_doc => {
						doc.lawyer = lawyer_doc ? {
							_id: lawyer_doc._id.toString(),
							name: lawyer_doc.name
						} : {
							_id: "",
							name: ""
						};

						fn1();
					});

					if (doc.codes.length)
						spook.models.Code.aggregate([{
							$match: {
								_id: {
									$in: doc.codes.map(v =>
										new ObjectId(v)
									)
								}
							}
						}, {
							$project: {
								_id : {
									$toString: "$_id"
								},
								code: 1,
								description: 1
							}
						}]).then(code_docs => {
							doc.codes = code_docs;

							fn1();
						});
					else
						fn1();
				});
			});
		},

		delete: (event, id, _id, channel) => {
			let n = 2;
			let fn = _ => {
				n--;

				if (n)
					return;

				event.sender.send(channel, id, true);
			}

			_id = new ObjectId(_id);

			spook.models.Log.findOne({_id}).then(doc => {
				spook.models.Case.findOne({_id: doc.case})
				.then(case_doc => {
					case_doc.logs_count--;
					case_doc.time -= doc.time_end - doc.time_start;

					case_doc.save(fn);
				});

				spook.models.Log.deleteOne({_id})
				.exec()
				.then(fn);
			});
		}
	},

	Lawyer: {
		new: (event, id, properties, channel) => {
			properties.user = new ObjectId(properties.user);

			spook.models.Lawyer.findOne({
				user: properties.user,
				name: new RegExp(
					"^" +
						literalRegExp(properties.name) +
						"$",
					"i"
				)
			}).then(doc => {
				if (!doc)
					spook.models.Lawyer.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc && doc._id.toString()
						)
					);
				else
					event.sender.send(channel, id);
			});
		},

		edit: (event, id, _id, properties, channel) => {
			_id = new ObjectId(_id);

			spook.models.Lawyer.findOne({
				_id,
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

		get: (event, id, user_id, skip, limit, filter, channel) => {
			let pipeline = [{
				$match: {
					user: new ObjectId(user_id)
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
			}];

			if (filter)
				pipeline[0].$match.name =
					new RegExp(literalRegExp(filter), "i");

			spook.models.Lawyer.aggregate(pipeline).then(docs =>
				event.sender.send(channel, id, docs)
			);
		},

		getOne: (event, id, user_id, key, channel) => {
			spook.models.Lawyer.findOne({
				user: new ObjectId(user_id),
				name: new RegExp(
					"^" +
						literalRegExp(key) +
						"$",
					"i"
				)
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
		},

		delete: (event, id, _id, channel) => {
			let n = 2;
			let fn = _ => {
				n--;

				if (n)
					return;

				event.sender.send(channel, id, true);
			}

			_id = new ObjectId(_id);

			spook.models.Log.find({
				lawyer: _id
			}).then(docs => {
				n += docs.length;

				docs.forEach(doc => {
					doc.lawyer = "";

					doc.save(fn);
				});

				fn();
			});

			spook.models.Lawyer
			.deleteOne({_id})
			.exec()
			.then(res =>
				res.ok && res.n ?
				fn() : event.sender.send(channel, id, false)
			);
		}
	},

	Code: {
		new: (event, id, properties, channel) => {
			properties.code = properties.code.toUpperCase();

			spook.models.Code.findOne({
				code: new RegExp(
					"^" + literalRegExp(properties.code) + "$",
					"i"
				)
			}).then(doc => {
				if (!doc)
					spook.models.Code.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc && doc._id.toString()
						)
					);
				else
					event.sender.send(channel, id);
			});
		},

		edit: (event, id, code, properties, channel) =>
			spook.models.Code.findOne({
				code: new RegExp(
					"^" + literalRegExp(code) + "$",
					"i"
				)
			}).then(doc => {
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

		get: (event, id, skip, limit, filter, channel) => {
			let pipeline = [{
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
			}];

			if (filter) {
				let regex = new RegExp(literalRegExp(filter), "i");

				pipeline.unshift({
					$match: {
						$or: [
							{ code: regex },
							{ description: regex }
						]
					}
				});
			}

			spook.models.Code.aggregate(pipeline).then(docs =>
				event.sender.send(channel, id, docs)
			);
		},

		getOne: (event, id, code, channel) =>
			spook.models.Code.findOne({
				code: new RegExp(
					"^" + literalRegExp(code) + "$",
					"i"
				)
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
			),

		trim: (event, id, codes, channel) => {
			let query = {
				code: {
					$nin: codes.map(v => new RegExp(
						"^" + literalRegExp(v) + "$",
						"i"
					))
				}
			};

			spook.models.Code.find(query).then(docs => {
				let fn0 = _ =>
					spook.models.Code
					.deleteMany(query)
					.exec()
					.then(res =>
						event.sender.send(
							channel,
							id,
							res.ok && res.n > 0
						)
					);

				if (!docs.length)
					fn0();

				codes = docs.map(doc => doc._id);

				spook.models.Log.find({
					codes: {
						$all: codes
					}
				}).then(docs => {
					if (!docs.length)
						fn0();

					let n = docs.length;
					let fn1 = _ => {
						n--;

						if (n)
							return;

						fn0();
					};

					docs.forEach(doc => {
						codes.forEach(v => {
							let i = doc.codes.indexOf(v);

							if (i != -1)
								doc.codes.splice(i, 1);
						});

						doc.save(fn1);
					});
				});
			});
		}
	},

	Case: {
		new: (event, id, properties, channel) => {
			properties.client = new ObjectId(properties.client);

			spook.models.Case.findOne({
				client: properties.client,
				name: new RegExp(
					"^" + literalRegExp(properties.name) + "$",
					"i"
				)
			}).then(doc => {
				if (!doc) {
					spook.models.Case.new(properties, doc =>
						event.sender.send(
							channel,
							id,
							doc && doc._id.toString()
						)
					);
				} else
					event.sender.send(channel, id);
			});
		},

		edit: (event, id, _id, properties, channel) =>
			spook.models.Case.findOne({
				_id: new ObjectId(_id)
			}).then(doc => {
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

		get: (event, id, client_id, skip, limit, filter, channel) => {
			let pipeline = [{
				$match: {
					client: new ObjectId(client_id)
				}
			}, {
				$addFields: {
					sort: {$toUpper: "$name"}
				}
			}, {
				$sort: {
					sort: 1
				}
			}, {
				$project: {
					_id: {
						$toString: "$_id"
					},
					client: {
						$toString: "$client"
					},
					name: 1,
					time: 1,
					logs_count: 1
				}
			}, {
				$skip: skip != null ? (skip < 0 ? 0 : skip) : 0
			}, {
				$limit: limit ? (limit <= 0 ? 1 : limit) : 1
			}];

			if (filter)
				pipeline[0].$match.name =
					new RegExp(literalRegExp(filter), "i");

			spook.models.Case.aggregate(pipeline).then(docs =>
				event.sender.send(channel, id, docs)
			)
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
