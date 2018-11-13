/**
 * Enable functionality for the client creation and interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, info.js, relay.js, tipper.js, sidebar.js
**/
const mod_client = {
	pref_btn: "<img class=sidebar_pref " +
		"src=../img/sidebar_pref.png " +
		"draggable=false>",
	list_visible: []
};
mod_client.list_visible.key = "";

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ =>
	mod_sidebar.init(
		client_space,
		128,
		64,
		mod_relay.Client.get,
		doc => doc.key || doc.name.toUpperCase(),
		(doc, index) => {
			doc.key = doc.key || doc.name.toUpperCase();
			doc.time = doc.time == null ? 0 : doc.time;
			doc.logs_count =
				doc.logs_count == null ? 0 : doc.logs_count;

			// Empty string.
			if (doc.name.search(/\S/) == -1)
				return;

			// Already created.
			if (mod_client.has(doc.key))
				return;


			/* Draw the client button element. Automatically select it
			   if it was still selected after being removed when
			   scrolling too far.
			*/
			let btn = q("#client_space !label");
			btn.innerHTML += doc.name + mod_client.pref_btn;

			if (index != null)
				client_space.insertBefore(
					btn,
					client_space.childNodes[index]
				);


			/* Set this as selected if it's still selected when it was
			   removed earlier.
			*/
			if (mod_client.selected == doc.key)
				btn.setAttribute("selected", 1);


			// Add client's data to list.
			let data = mod_client.get(doc.key);

			if (!data)
				data = {
					// Space for logs for this client.
					log_space: q(
						"#log !div " +
						"class=log_space " +
						"scroll=1 " +
						"invisible=1"
					),
					// All the log data for this client.
					logs: []
				};

			data.key = doc.key;
			data.name = doc.name;
			data.time = doc.time;
			data.logs_count = doc.logs_count;
			data.btn = btn;
			// This DOES NOT delete the document.
			data.remove = _ => mod_client.remove(data.key);

			// Tag as visible in the list.
			mod_client.list_visible.push(doc.key);


			// Setup button.
			btn.addEventListener("click", event => {
				// Clicked preference button.
				if (event.target != btn)
					return mod_pref.show(data.name);

				/* If there was a previously selected client, hide
				   their log interface.
				*/
				let prev = mod_client.selected;

				if (prev) {
					prev = mod_client.get(prev);

					if (prev.hasOwnProperty("remove")) {
						prev.log_space.setAttribute("invisible", 1);
						prev.btn.removeAttribute("selected", 1);
					} else
						mod_client.remove(mod_client.selected);
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


			/* Hide the indication when there are no clients and reveal
			   the log interface.
			*/
			client_new.removeAttribute("glow");
			space_empty.setAttribute("invisible", 1);
			info.removeAttribute("invisible");
			log_ctrl.removeAttribute("invisible");

			return data;
		},
		data => {
			if (data.hasOwnProperty("btn"))
				data.btn.remove();

			/* Only delete the visual stuff when this is the selected
			   client.
			*/
			if (mod_client.selected != data.key ||
				!data.hasOwnProperty("remove")) {
				data.log_space.remove();

				return true;
			} else {
				delete data.remove;
				delete data.btn;
			}
		}
	)(mod_client)
));

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

tipper(client_new, "New Client");

spook.return();
