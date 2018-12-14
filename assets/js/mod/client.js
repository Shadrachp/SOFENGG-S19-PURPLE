/**
 * Enable functionality for the client creation and interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, info.js, relay.js, tipper.js, sidebar.js
**/
const mod_client = {
	pref_btn: "<img class=sidebar_pref " +
		"src=../img/sidebar_pref.png " +
		"draggable=false>"
};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	mod_datastore.init(client_space, 128, 64, {
		getter: (skip, limit) =>
			mod_relay.Client.get(
				mod_login.getUserId(),
				skip,
				limit,
				client_search.value
			),

		key: doc =>
			doc.key || doc.name.toUpperCase(),

		new: (doc, index) => {
			if (doc.name.search(/\S/) == -1)
				return;

			let key = doc.key || doc.name.toUpperCase();

			if (mod_client.selected &&
				mod_client.selected.key == key) {
				for (let k in doc)
					mod_client.selected[k] == doc[k];

				mod_client.selected.key =
					doc.key || doc.name.toUpperCase();
				doc = mod_client.selected;
			} else {
				doc.key = doc.key || doc.name.toUpperCase();
				doc.case_space = q(
					"#case_space !div " +
					"class=case_space " +
					"scroll=0 " +
					"invisible=1"
				)
				doc.cases = mod_case.new(doc._id, doc.case_space);

				doc.cases.init();
			}

			let btn = doc.btn = q("!label");
			btn.innerHTML = doc.name + mod_client.pref_btn;

			if (mod_client.selected == doc)
				btn.setAttribute("selected", 1);

			if (index == null)
				client_space.appendChild(btn);
			else
				client_space.insertBefore(
					btn,
					client_space.childNodes[index]
				);

			btn.addEventListener("click", event => {
				if (event.target != btn)
					return mod_client_edit.show(doc);

				let prev = mod_client.selected;

				if (prev) {
					if (prev.hasOwnProperty("btn")) {
						prev.case_space.setAttribute("invisible", 1);
						prev.btn.removeAttribute("selected", 1);

						if (prev.cases.selected)
							prev.cases.selected.log_space
								.setAttribute("invisible", 1);
					} else
						prev.case_space.remove();
				}


				info_name.innerHTML = doc.name;

				mod_client.selected = doc;
				doc.case_space.removeAttribute("invisible");
				btn.setAttribute("selected", 1);

				if (doc.cases.selected) {
					mod_info.stats_time_update(
						doc.cases.selected.time
					);
					mod_info.stats_log_update(
						doc.cases.selected.logs_count
					);

					doc.cases.selected.log_space
						.removeAttribute("invisible");
				} else {
					mod_info.stats_time_update(0);
					mod_info.stats_log_update(0);
				}
			});

			if (!mod_client.selected)
				btn.click();

			client_new.removeAttribute("glow");
			space_empty.setAttribute("invisible", 1);
			info.removeAttribute("invisible");
			ctrl_logs.removeAttribute("invisible");
			case_space.removeAttribute("invisible");

			return doc;
		},

		remove: doc => {
			doc.btn.remove();

			if (mod_client.selected != doc)
				doc.case_space.remove();
			else
				delete doc.btn;

			return true;
		},

		move: (doc, index) => {
			if (!doc.hasOwnProperty("btn"))
				return;

			if (index == null)
				client_space.appendChild(doc.btn);
			else
				client_space.insertBefore(
					doc.btn,
					client_space.childNodes[index]
				);
		},

		flush: _ => {
			if (!mod_client.selected)
				return;

			mod_client.selected.cases.flush();

			mod_client.selected.case_space.remove();
			mod_client.selected = null;
		}
	})(mod_client);
}));

client_search.addEventListener("input", _ => {
	mod_client.flush();
	mod_client.init();
});

client_new.addEventListener("click", _ => {
	client_popup_input.value = "";

	client_popup.removeAttribute("invisible");
	client_popup_input.focus();
});

tipper(client_new, "New Client");

spook.return();
