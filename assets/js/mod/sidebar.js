/**
 * Generators for the sidebar.
 *
 * @author Llyme
**/
const mod_sidebar = {};

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
 *
 * @param {Function} callback_key - this should return what the key
 * would look like in the list.
 *
 * @param {Function} callback_new - this will be called whenever a
 * new document is generated.
 *
 * @param {Function} callback_remove - this will be called whenever
 * a document is removed from the list.
**/
mod_sidebar.init = (space,
					limit,
					buffer,
					getter,
					callback_key,
					callback_new,
					callback_remove) => {
	let list = [];
	let dump = [];
	let busy;
	let skip = 0;

	let dump_add = (key, sort) => {
		let i;
		// Try to sort the list if needed.
		if ((sort == null || sort) && dump.length) {
			for (i = 0; i < dump.length && dump[i] < key; i++);

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

		getter(skip - len, len)(docs => {
			skip -= docs.length;

			if (dump.length + docs.length > limit)
				dump.splice(limit - dump.length - docs.length)
					.map(key => {
						if (callback_remove(list[key]))
							delete list[key];
					});

			docs.map(doc => {
				let key = callback_key(doc);
				list[key] = callback_new(doc, dump_add(key));
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
		getter(skip + dump.length, buffer)(docs => {
			skip += docs.length;

			if (dump.length + docs.length > limit)
				dump.splice(0, dump.length + docs.length - limit)
					.map(key => {
						if (callback_remove(list[key]))
							delete list[key];
					});

			docs.map(doc => {
				let key = callback_key(doc);
				list[key] = callback_new(doc, dump_add(key));
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
		let scroll = space.scrollHeight -
			space.clientHeight;
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
			let key = callback_key(doc);
			let data = callback_new(doc, dump_add(key));

			if (data)
				list[key] = data;

			return data ? true : false;
		};

		mod.remove = key => {
			if (dump.indexOf(key) > -1)
				dump.splice(dump.indexOf(key), 1);

			if (callback_remove(list[key]))
				delete list[key];
		};

		mod.move = (key_old, key_new) => {
			dump.splice(dump.indexOf(key_old), 1, key_new);

			list[key_new] = list[key_old];

			delete list[key_old];
		};

		mod.get = key => list.hasOwnProperty(key) ? list[key] : null;

		mod.has = key =>
			dump.indexOf(key) > -1 &&
			list[key] && list[key].hasOwnProperty("remove");

		getter(0, limit)(docs => {
			docs.map(doc => {
				let key = callback_key(doc);

				dump_add(key, false);

				list[key] = callback_new(doc);
			});

			space.addEventListener("scroll", event => scroll());

			space.addEventListener("wheel", event =>
				scroll(event.deltaY < 0 ? -1 : 1)
			);
		});
	};
};

spook.return();
