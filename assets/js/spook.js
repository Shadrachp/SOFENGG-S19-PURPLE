/**
 * A very spooky, sneaky, scary skeletal framework. The backbone
 * overlord of the modules and libraries.
 *
 * @author Llyme
**/
const spook = {};

/* Check if `document` variable is there (this indicates if this
   thing is being run from an HTML parser, which nodeJS isn't
   allowed to be used, except with Electron API).
*/
if ((_ => { try { return !!document } catch(_) { } })()) {
	//-- Client-Side --//
	let count = 0;
	let done;
	let queue = [];

	/**
	 * Sets `spook.waitForChildren` into a direct callback (literally
	 * just calls the callback immediately), executes all the
	 * callbacks in the queue, and destroys `spook.return` so nobody
	 * else can tamper with these things.
	**/
	let destruct = _ => {
		spook.waitForChildren = callback => callback();
		queue.map(v => v());

		delete spook.return;
	};

	/**
	 * Load a script module.
	 * @param {String|Array[String]} v - The script/s to be loaded. File
	 * must be inside the `assets/js/` folder. If array, the
	 * left-most will be loaded first.
	 * @return {HTMLElement|Array[HTMLElement]} the tag/s created.
	**/
	spook.load = v => {
		if (typeof(v) == "object")
			return v.map(v => spook.load(v));

		// Increment counter.
		count++;

		let s = document.createElement("script");
		s.src = "../js/" + v + ".js";
		s.async = false;

		document.head.appendChild(s);

		return s;
	};

	/**
	 * Used by modules/libraries to tell `spook.js` that it's job is
	 * done, decrementing the counter. If `spook.js` is done calling
	 * all the scripts and there are no more loading scripts, this will
	 * call `destruct` (SEE ABOVE).
	**/
	spook.return = name => {
		count--;

		if (done && !count)
			destruct();
	};

	/**
	 * This makes `spook.js` stop calling more scripts and wait for all
	 * the modules/libraries to finish. This will also call `destruct`
	 * when everything was done loading already.
	**/
	spook.done = _ => {
		// No more loading.
		delete spook.load;
		delete spook.done;

		done = 1;

		if (!count)
			destruct();
	};

	spook.waitForChildren = callback => queue.push(callback);
} else {
	//-- Server-Side --//
	let queue = [];

	/**
	 * Wait for all the children (AKA modules) to load. The `callback`
	 * will immediately be called if all the children are already
	 * loaded.
	 *
	 * @param {Function} callback - this will be called when everything
	 * is loaded.
	**/
	spook.waitForChildren = callback => queue.push(callback);

	// Load everything in the `main` folder (non-recursive).
	setTimeout(_ => {
		["relay", "models/__main__", "database"].map(v =>
			spook[v.split("/")[0]] = require("./main/" + v + ".js")
		);


		// Flush the queue and change `waitForChildren`.
		spook.waitForChildren = callback => callback();
		queue.map(v => v());
		delete queue;
	}, 0);

	// Give the results to the user.
	module.exports = spook;
}
