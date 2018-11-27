/**
 * A limited database (like a RAM).
 *
 * @author Llyme
**/
const mod_datastore = {};

/**
 * Create a generator for the given getter function.
 *
 * @param {HTMLElement} space - The space which will be check for
 * scrolling.
 *
 * @param {Integer} limit - the max size until it will generate more
 * documents.
 *
 * @param {Integer} buffer - the max size for each request. This must
 * not be greater than `limit`.
 *
 * @param {Function} getter - the `.get` function from `relay.js`.
**/
mod_datastore.init = (space, limit, buffer, callbacks) => {
	/* The workID is to help distinguish if the datastore has been
	   flushed. This will stop on-going requests that will pry the
	   datastore into adding data that should've been flushed before.
	*/
	let workID = viscount();
	// List of all the documents.
	let list = {};
	// Dumped list of keys. Used for sorting.
	let dump = [];
	// This will function as a debounce for scrolling.
	let busy;
	// How many documents were skipped. Flushing sets it back to 0.
	let skip = 0;

	{
		let defaults = {
			sort: (a, b) => a < b,
			flush: _ => _
		};

		for (let k in defaults)
			if (!callbacks.hasOwnProperty(k))
				callbacks[k] = defaults[k];


		// Wrap `callbacks.new`.
		let callback_new = callbacks.new;

		callbacks.new = (doc, index) => {
			if (list[callbacks.key(doc)])
				return;

			return callback_new(doc, index);
		};
	}

	/**
	 * Keep track on how many requests are on-going.
	**/
	let getter_counter = id => {
		if (id == null)
			return getter_counter.count++;

		getter_counter.count--;

		if (workID != id) {
			if (!getter_counter) {
				getter_counter.dump.forEach(v => viscount(v));
				getter_counter.dump = [];
			}

			return true;
		}
	};
	getter_counter.count = 0; // Total on-going requests.
	getter_counter.dump = []; // List of previous IDs.

	/**
	 * Add to dump list (dump list is literally just for 'dumping' all the
	 * keys in a list to sort them easily).
	 *
	 * @param {String} key - the key that will be used as an identifier for
	 * data storage. This is also used for sorting (ascending order; A-Z).
	 *
	 * @param {Boolean|null} sort - Find a suitable index if `true` or
	 * `null`, otherwise it will be added at the bottom of the list if
	 * `false`.
	 *
	 * @return {Integer|null} - the position that should be placed into if
	 * you want an ordered list, otherwise `null` if it should be placed
	 * at the bottom.
	**/
	let dump_add = (key, sort) => {
		let i;

		// Try to sort the list if needed.
		if ((sort == null || sort) && dump.length) {
			for (i = 0;
				i < dump.length &&
				callbacks.sort(dump[i], key);
				i++);

			if (i < dump.length) {
				dump.splice(i, 0, key);

				return i;
			}
		}

		dump.push(key);
	};

	/**
	 * Load previous documents. This is triggered if the user scrolls
	 * upwards.
	**/
	let load_back = _ => {
		busy = true;

		if (!skip)
			return busy = false;

		// skipped data could be less than the buffer.
		let len = Math.min(skip, buffer);

		let id = workID;
		getter_counter();
		callbacks.getter(skip - len, len)(docs => {
			if (getter_counter(id))
				return;

			skip -= docs.length;

			if (dump.length + docs.length > limit)
				dump.splice(limit - dump.length - docs.length).map(key => {
					if (callbacks.remove(list[key]))
						delete list[key];
				});

			docs.map(doc => {
				let key = callbacks.key(doc);

				if (list[key])
					return;

				list[key] = callbacks.new(doc, dump_add(key));
			});

			busy = false;	
		});
	};

	/**
	 * Load next documents. This is triggered if the user scrolls
	 * downwards.
	**/
	let load_fore = _ => {
		busy = true;

		let id = workID;
		getter_counter();
		callbacks.getter(skip + dump.length, buffer)(docs => {
			if (getter_counter(id))
				return;

			skip += docs.length;

			if (dump.length + docs.length > limit)
				dump.splice(0, dump.length + docs.length - limit)
					.map(key => {
						if (callbacks.remove(list[key]))
							delete list[key];
					});

			docs.map(doc => {
				let key = callbacks.key(doc);

				if (list[key])
					return;

				list[key] = callbacks.new(doc, dump_add(key));
			});

			busy = false;
		});
	};

	/**
	 * Load more documents based on scroll offset.
	 *
	 * @param {Integer|null} direction = null - 1 = Forward;
	 * -1 = Backward; 0 or null = Auto (Forward, then backward.)
	**/
	let scroll = direction => {
		if (busy)
			return;

		/* We place a buffer of 20% of the scroll height so that the
		   user doesn't necessarily need to scroll at the very
		   top/bottom to load more.
		*/
		let scroll = space.scrollHeight - space.clientHeight;
		let buffer = scroll/5;

		if (direction != -1 && space.scrollTop >= scroll - buffer)
			// Forward scroll.
			load_fore();
		else if (direction != 1 && space.scrollTop <= buffer)
			// Backward scroll.
			load_back();
	};

	return mod => {
		mod.new = (doc, sort) => {
			let key = callbacks.key(doc);
			let data = callbacks.new(doc, dump_add(key));

			if (data)
				list[key] = data;

			return data;
		};

		mod.remove = key => {
			if (dump.indexOf(key) > -1)
				dump.splice(dump.indexOf(key), 1);

			if (callbacks.remove(list[key]))
				delete list[key];
		};

		mod.move = (key_old, key_new) => {
			dump.splice(dump.indexOf(key_old), 1);

			list[key_new] = list[key_old];

			delete list[key_old];

			callbacks.move(list[key_new], dump_add(key_new));
		};

		mod.flush = _ => {
			getter_counter.dump.push(workID);
			workID = viscount();

			dump.forEach(key => callbacks.remove(list[key]));

			dump = [];
			list = {};
			skip = 0;

			callbacks.flush();
		};

		mod.get = key => list.hasOwnProperty(key) ? list[key] : null;

		mod.has = key => list[key] != null;

		mod.init = _ => {
			let id = workID;
			getter_counter();
			callbacks.getter(0, limit)(docs => {
				if (getter_counter(id))
					return;

				if (docs) {
					docs.map(doc => {
						let key = callbacks.key(doc);

						dump_add(key, false);

						list[key] = callbacks.new(doc);
					});

					viscount(id);

					init_id = null;
				}
			});
		};

		space.addEventListener("scroll", event => scroll());

		space.addEventListener("wheel", event =>
			scroll(event.deltaY < 0 ? -1 : 1)
		);

		return mod;
	};
};

spook.return();
