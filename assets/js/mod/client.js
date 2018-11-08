/**
 * Enable functionality for the client creation and interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, info.js, relay.js, tipper.js, datastore.js
**/
const mod_client = {
	/* List of clients. The key is the client's name in uppercase, and
	   the value is the client's name that isn't converted to uppercase
	   and the element associated with it.

		list[CLIENTNAME] = {
			key: "CLIENTNAME",
			name: "ClientName",
			time: 120, // 2 hours
			log_space: HTMLElement,
			logs: [
				{
					date: DateObject,
					code: ["code 1", "code 2", ...],
					time: [time_start, time_end],
					lawyer: "LawyerName",
					description: "Sample description."
				}
			],
			logs_count: 1,
			btn: HTMLElement,
			remove: Function
		}
	*/
	list: {},
	// Uppercased names are dumped here. This is also used for sorting.
	list_dump: [],
	// List of visible clients on the screen. Used by the search bar.
	list_visible: [],
	/* Currently selected client. We use the uppercased name of the
	   client as the value.
	*/
	selected: null,
	// This prevents mass requests for more documents.
	scroll_busy: false
};
// Default filter key for the search bar.
mod_client.list_visible.key = "";

/**
 * Create a new entry for the client space.
 * @param {String} name - The name of the entry.
 * @param {Integer} time - The total accumulated time for the user.
 * @param {Integer} logs_count - Total logs created for this client.
 * @param {Boolean} sort = true - If the list gets sorted or not.
 * @returns {Boolean} `true` if successful, otherwise `false`.
**/
mod_client.space_new = (name, time, logs_count, sort) => {
	time = time == null ? 0 : time;
	logs_count = logs_count == null ? 0 : logs_count;
	sort = sort == null ? true : sort;

	let key = name.toUpperCase();


	// Return nothing if already created or empty string.
	if (key.search(/\S/) == -1 ||
		mod_client.list[key] && mod_client.list[key].remove)
		return false;


	/* Draw the client button element. Automatically select it if it
	   was still selected after being removed when scrolling too far.
	*/
	let btn = q("#client_space !label");
	btn.innerHTML = name;

	if (mod_client.selected == key)
		btn.setAttribute("selected", 1);


	// Add client's data to list.
	let data = mod_client.list[key];

	if (!data)
		data = mod_client.list[key] = {
			// Space for logs for this client.
			log_space: q(
				"#log !div class=log_space scroll=1 invisible=1"
			),
			// All the log data for this client.
			logs: []
		};

	data.key = key;
	data.name = name;
	data.time = time;
	data.logs_count = logs_count;
	data.btn = btn;
	// This DOES NOT delete the document.
	data.remove = _ => {
		btn.remove();

		/* Only delete the visual stuff when this is the selected
		   client.
		*/
		if (mod_client.selected != data.key) {
			delete mod_client.list[data.key];

			data.log_space.remove();
		} else {
			delete data.remove;
			delete data.btn;
		}
	};

	mod_client.list_visible.push(key); // Tag as visible in the list.

	btn.addEventListener("click", _ => {
		/* If there was a previously selected client, hide their
		   log interface.
		*/
		let prev = mod_client.selected;

		if (prev) {
			if (mod_client.list[prev].hasOwnProperty("remove")) {
				mod_client.list[prev].log_space
					.setAttribute("invisible", 1);
				mod_client.list[prev].btn
					.removeAttribute("selected", 1);
			} else {
				mod_client.list[prev].log_space.remove();

				delete mod_client.list[prev];
			}
		}


		// Setup the information interface.
		info_name.innerHTML = data.name;
		mod_info.stats_time_update(data.time);
		mod_info.stats_log_update(data.logs_count);


		// Tag as selected and show its log interface.
		mod_client.selected = data.key;
		data.log_space.removeAttribute("invisible");
		btn.setAttribute("selected", 1);
	});


	/* Select this client automatically if this was the first
	   client.
	*/
	if (!mod_client.selected)
		btn.click();


	/* Hide the indication when there are no clients and reveal the
	   log interface.
	*/
	client_new.removeAttribute("glow");
	space_empty.setAttribute("invisible", 1);
	info.removeAttribute("invisible");
	log_ctrl.removeAttribute("invisible");


	// Try to sort the list if needed.
	if (sort && mod_client.list_dump.length) {
		let n = 0;

		for (n = 0;
			n < mod_client.list_dump.length &&
			mod_client.list_dump[n] < key;
			n++);

		if (n < mod_client.list_dump.length) {
			let prev = mod_client.list[mod_client.list_dump[n]].btn;

			mod_client.list_dump.splice(n, 0, key);
			client_space.insertBefore(btn, prev);

			return true;
		}
	}

	mod_client.list_dump.push(key);

	return true;
};

client_search.addEventListener("input", _ => {
	let k = client_search.value.toUpperCase();

	if (k.search(new RegExp(mod_client.list_visible.key)) != -1) {
		mod_client.list_visible.key = "^" + k;

		mod_client.list_visible = mod_client.list_visible.filter(
			v => {
				let d = v.indexOf(k) != -1;

				if (!d)
					mod_client.list[v].btn.style.display = "none";

				return d;
			}
		);
	} else {
		mod_client.list_visible = [];

		for (let v in mod_client.list) if (v.indexOf(k) != -1) {
			mod_client.list_visible.push(v);
			mod_client.list[v].btn.style.display = "block";
		} else
			mod_client.list[v].btn.style.display = "none";
	}

	mod_client.list_visible.key = "^" + k;
});

client_new.addEventListener("click", _ => {
	client_popup_input.value = "";

	client_popup.removeAttribute("invisible");
	client_popup_input.focus();
});

info_ctrl_pref.addEventListener("click", _ =>
	mod_pref.show(mod_client.list[mod_client.selected].name)
);

tipper(client_new, "New Client");

// Load the clients as soon as the database has connected.
spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	let limit = 128,
		buffer = 64;
	let datastore = new mod_datastore(
		limit,
		buffer,
		mod_relay.Client.get
	);

	/**
	 * Load previous documents.
	**/
	let load_back = _ => {
		if (mod_client.scroll_busy)
			return;

		mod_client.scroll_busy = true;

		datastore.load(true, (flag, docs) => {
			if (!flag)
				return mod_client.scroll_busy = false;

			if (mod_client.list_dump.length + docs.length > limit)
				mod_client.list_dump.splice(
					limit - mod_client.list_dump.length - docs.length
				).map(
					key => mod_client.list[key].remove()
				);

			docs.map(doc => mod_client.space_new(doc.name));

			mod_client.scroll_busy = false;
		});

		return true;
	};

	/**
	 * Load next documents.
	**/
	let load_fore = _ => {
		if (mod_client.scroll_busy)
			return;

		mod_client.scroll_busy = true;

		datastore.load(false, (flag, docs) => {
			if (!flag)
				return mod_client.scroll_busy = false;

			if (mod_client.list_dump.length + docs.length > limit)
				mod_client.list_dump.splice(
					0,
					mod_client.list_dump.length + docs.length - limit
				).map(
					key => mod_client.list[key].remove()
				);

			docs.map(doc => mod_client.space_new(doc.name));

			mod_client.scroll_busy = false;
		});

		return true;
	};

	/**
	 * Load more documents based on scroll offset.
	 *
	 * @param {Integer|null} direction = null - 1 = Forward;
	 * -1 = Backward; 0 or null = Auto (Forward, then backward.)
	**/
	let scroll = direction => {
		if (mod_client.scroll_busy)
			return;

		/* We place a buffer of 20% of the scroll height so that the
		   user doesn't necessarily need to scroll at the very
		   top/bottom to load more.
		*/
		let scroll = client_space.scrollHeight -
			client_space.clientHeight;
		let buffer = scroll/5;

		if (direction != -1 &&
			client_space.scrollTop >= scroll - buffer)
			// Forward scroll.
			load_fore();
		else if (direction != 1 &&
			client_space.scrollTop <= buffer)
			// Backward scroll.
			load_back();
	};

	mod_relay.Client.get(0, buffer)(docs => {
		docs.map(doc => {
			mod_client.space_new(doc.name, 0, 0, false);
		});

		client_space.addEventListener("scroll", event => scroll());

		client_space.addEventListener("wheel", event =>
			scroll(event.deltaY < 0 ? -1 : 1)
		);
	});
}));

spook.return();
