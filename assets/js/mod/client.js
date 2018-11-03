/**
 * Enable functionality for the client interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, info.js, relay.js, tipper.js
**/
const mod_client = {
	/* List of clients. The key is the client's name in uppercase, and
	   the value is the client's name that isn't converted to uppercase
	   and the element associated with it.

		list[CLIENTNAME] = {
			name: "ClientName",
			time: 120, // 2 hours
			log_space: HTMLElement,
			logs: [
				{
					date,
					code,
					time: [time_start, time_end],
					lawyer,
					description
				}
			],
			logs_count: 5,
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
	/* Offset from the first client in the database
	   (case-insensitive alphabetical order).
	*/
	list_skip: 0,
	/* Maximum buffer size for the client list before it needs to load
	   more documents from the database. Any excess documents will be
	   removed. The selected client will not be deselected when
	   removed.
	*/
	list_limit: 128,
	/* This is the max number of documents that will be returned
	   for each request.
	*/
	list_buffer: 64,
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

	let k = name.toUpperCase();


	// Return nothing if already created or empty string.
	if (mod_client.list[k] || k.search(/\S/) == -1)
		return false;


	/* Draw the client button element (We use a customized label
	   since it's a lot easier to render than the usual 'button'
	   element).
	*/
	let btn = q("#client_space !label");
	btn.innerHTML = name;


	// Add client's data to list.
	if (!mod_client.list.hasOwnProperty(k))
		mod_client.list[k] = {
			// Space for logs for this client.
			log_space: q(
				"#log !div class=log_space scroll=1 invisible=1"
			),
			// All the log data for this client.
			logs: []
		};

	mod_client.list[k].name = name;
	mod_client.list[k].time = time;
	mod_client.list[k].logs_count = logs_count;
	mod_client.list[k].btn = btn;
	// This DOES NOT delete the document.
	mod_client.list[k].remove = _ => {
		btn.remove();

		/* Only delete the visual stuff when this is the selected
		   client.
		*/
		if (mod_client.selected != k) {
			delete mod_client.list[k];

			mod_client.log_space.remove();
		} else
			delete mod_client.list[k].btn;
	};

	mod_client.list_visible.push(k); // Tag as visible in the list.

	btn.addEventListener("click", _ => {
		/* If there was a previously selected client, hide their
		   log interface.
		*/
		let prev = mod_client.selected;

		if (prev) {
			mod_client.list[prev].log_space
				.setAttribute("invisible", 1);

			if (mod_client.list[prev].hasOwnProperty("btn"))
				mod_client.list[prev].btn
					.removeAttribute("selected", 1);
			else
				delete mod_client.list[prev];
		}


		// Setup the information interface.
		info_name.innerHTML = name;
		mod_info.stats_time_update(mod_client.list[k].time);
		mod_info.stats_log_update(mod_client.list[k].logs_count);


		// Tag as selected and show its log interface.
		mod_client.selected = k;
		mod_client.list[k].log_space.removeAttribute("invisible");
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
	info_div.removeAttribute("invisible");
	log_ctrl.removeAttribute("invisible");


	// Try to sort the list if needed.
	if (sort && mod_client.list_dump.length) {
		let n = 0;

		for (n = 0;
			n < mod_client.list_dump.length &&
			mod_client.list_dump[n] < k;
			n++);

		if (n < mod_client.list_dump.length) {
			let prev = mod_client.list[mod_client.list_dump[n]].btn;

			mod_client.list_dump.splice(n, 0, k);
			client_space.insertBefore(btn, prev);

			return true;
		}
	}

	mod_client.list_dump.push(k);

	return true;
};

/**
 * Load previous documents.
**/
mod_client.scroll_load_back = _ => {
	if (mod_client.scroll_busy)
		return;

	mod_client.scroll_busy = true;

	if (!mod_client.list_skip) {
		// Nothing was skipped!
		mod_client.scroll_busy = false;

		return;
	}

	let skip = Math.min(
		mod_client.list_buffer,
		mod_client.list_skip
	);

	mod_relay.Client.get(
		mod_client.list_skip - skip,
		skip,
	)(docs => {
		if (mod_client.list_dump.length + docs.length >
			mod_client.list_limit)
			mod_client.list_dump.splice(
				mod_client.list_limit -
				mod_client.list_dump.length - docs.length
			).map(
				k => mod_client.list[k].remove()
			);

		docs.map(doc => mod_client.space_new(doc.name));

		mod_client.list_skip -= docs.length;
		mod_client.scroll_busy = false;
	});

	return true;
};

/**
 * Load next documents.
**/
mod_client.scroll_load_fore = _ => {
	if (mod_client.scroll_busy)
		return;

	mod_client.scroll_busy = true;

	mod_relay.Client.get(
		mod_client.list_skip +
			mod_client.list_dump.length,
		mod_client.list_buffer,
	)(docs => {
		if (mod_client.list_dump.length + docs.length >
			mod_client.list_limit)
			mod_client.list_dump.splice(
				0,
				mod_client.list_dump.length + docs.length -
				mod_client.list_limit
			).map(
				k => mod_client.list[k].remove()
			);

		docs.map(doc => mod_client.space_new(doc.name));

		mod_client.list_skip += docs.length;
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
mod_client.scroll_load = direction => {
	if (mod_client.scroll_busy)
		return;

	/* We place a buffer of 20% of the scroll height so that the
	   user doesn't necessarily scroll at the very top/bottom to
	   load more.
	*/
	let scroll = client_space.scrollHeight -
		client_space.clientHeight;
	let buffer = scroll/5;

	if (direction != -1 &&
		client_space.scrollTop >= scroll - buffer)
		// Forward scroll.
		mod_client.scroll_load_fore();
	else if (direction != 1 &&
		client_space.scrollTop <= buffer)
		// Backward scroll.
		mod_client.scroll_load_back();
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

tipper(client_new, "<small>New Client</small>");

spook.waitForChildren(_ => {
	// Load the clients as soon as the database has connected.
	mod_relay.waitForDatabase(_ => {
		mod_relay.Client.get(0, mod_client.list_limit)(docs => {
			docs.map(doc => {
				mod_client.space_new(doc.name, 0, 0, false);
			});

			client_space.addEventListener("scroll", event =>
				mod_client.scroll_load()
			);

			client_space.addEventListener("wheel", event =>
				mod_client.scroll_load(
					event.deltaY < 0 ? -1 : 1
				)
			);
		});
	});
});

spook.return();
