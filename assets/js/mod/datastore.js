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
	let list = [];
	let dump = [];
	let busy;
	let skip = 0;

	{
		if (!callbacks.hasOwnProperty("sort"))
			callbacks.sort = (a, b) => a < b;

		let callback_new = callbacks.new;

		callbacks.new = (doc, index) => {
			if (list[callbacks.key(doc)])
				return;

			return callback_new(doc, index);
		};
	}

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

		callbacks.getter(skip - len, len)(docs => {
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

		callbacks.getter(skip + dump.length, buffer)(docs => {
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

			return data ? true : false;
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

		mod.get = key => list.hasOwnProperty(key) ? list[key] : null;

		mod.has = key => list[key] != null;

		mod.init = _ => {
			callbacks.getter(0, limit)(docs => {
				if (docs)
					docs.map(doc => {
						let key = callbacks.key(doc);

						dump_add(key, false);

						list[key] = callbacks.new(doc);
					});

				space.addEventListener("scroll", event => scroll());

				space.addEventListener("wheel", event =>
					scroll(event.deltaY < 0 ? -1 : 1)
				);
			});
		};

		return mod;
	};
};

spook.return();
