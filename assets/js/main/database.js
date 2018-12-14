const fs = require("fs");
const {spawn} = require("child_process");
const mongoose = require("mongoose");
const crypto = require("crypto");
const mongod = "./mongoDB/bin/mongod";




//-- Setup interface. --//

const database = {
	// If the database is connected.
	connected: false,
	/**
	 * Connect to a database. This will be persistent and will retry
	 * if it fails its connection until it succeeds. This function is a
	 * one-time use and will be destroyed as soon as the user calls it.
	 *
	 * @param String url - the url for your database (AKA its name).
	 * @param Function() callback - this will be called when the
	 * connection is successful.
	**/
	connect: (url, callback) => {
		// Make this function a one-time only.
		delete database.connect;

		let renew = false;

		try {
			fs.accessSync("mongodbdata");
		} catch (_) {
			fs.mkdirSync("mongodbdata");
			renew = true;
		}

		mongoose.connection.once("open", _ => {
			database.connected = true;

			callback(renew);
		});

		let f = _ => {
			// NEVER GIVE UP
			mongoose.connection.once("error", f);

			mongoose.connect(url, {
				useNewUrlParser: true
			});
		};

		// Loop until connected.
		f();
	}
};




//-- Melee Initialization --//

// Start the server asynchronously.
setTimeout(_ => {
	const pipe = spawn(mongod, [
		"--bind_ip", "127.0.0.1",
		"--port", "27017",
		"--dbpath", "mongodbdata"
	]);

	pipe.stdout.on("data", v => console.log(v.toString("utf8")));
	pipe.stderr.on("data", v => console.log(v.toString("utf8")));
	pipe.on("close", v => console.log("Exited with code: " + v));
}, 0);

module.exports = database;