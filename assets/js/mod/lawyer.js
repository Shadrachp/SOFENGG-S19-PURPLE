/**
 * Enable functionality for the log's lawyer interface in the sidebar.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, tipper.js, sidebar.js
**/
const mod_lawyer = {
	string: {
		tooltip_search:
			"<center small>" +
			"<b style=color:var(--info)>TYPE</b> to search for " +
			"<b style=color:var(--accent-lawyer)>LAWYERS</b>.<br>" +
			"</center>",
		tooltip_load:
			"<center small style=color:var(--info)>LOADING...</center>"
	},
	callback: {
		rename: (event, doc, name) =>
			mod_relay.Lawyer.edit(doc._id, {name})(flag => {
				if (flag) {
					let key = name.toUpperCase();
					let key_old = doc.key;

					doc.key = key;
					doc.name = doc.btn.innerHTML = name;

					mod_lawyer.move(key_old, key);

					mod_client.flush();
					mod_client.init();
				}

				event.return(flag);
			}),
		delete: (event, doc) =>
			mod_relay.Lawyer.delete(doc._id)(flag => {
				if (flag) {
					mod_lawyer.flush();
					mod_client.flush();
					mod_lawyer.init();
					mod_client.init();
				}

				event.return(flag);
			})
	},
	setLawyerCallbacks: (input, callback) => {
		callback = callback || (_ => _);

		let config = {
			debounce: {},
			tooltip: null,
			update: null,
			fn: _ => {
				if (!config.update)
					return;

				if (!input.value) {
					config.tooltip = drool.tooltip(
						input,
						mod_lawyer.string.tooltip_search,
						8
					);

					return config.update([]);
				}

				let key = input.value.toUpperCase();

				if (config.debounce.hasOwnProperty(key))
					return;

				config.debounce[key] = 1;

				if (config.tooltip)
					config.tooltip();

				if (key) {
					config.tooltip = drool.tooltip(
						input,
						mod_lawyer.string.tooltip_load,
						8
					);

					mod_relay.Lawyer.get(
						mod_login.getUserId(),
						0,
						32,
						key
					)(docs => {
						delete config.debounce[key];

						if (input.value.toUpperCase() == key) {
							config.tooltip = config.tooltip();

							config.update(docs.map(doc => doc.name));
						}
					});
				}
			}
		};

		input.addEventListener("focus", _ => {
			if (input.getAttribute("debounce"))
				return;

			input.setAttribute("debounce", 1);

			config.update = drool.list(
				input,
				[],
				null,
				(v, i) => {
					input.value = v;
					input.blur();

					return true;
				}
			);

			config.fn();
		});

		input.addEventListener("input", config.fn);

		input.addEventListener("keydown", event =>
			(event.keyCode == 13 || event.keyCode == 27) ?
				input.blur() : 0
		);

		input.addEventListener("blur", _ => {
			if (config.tooltip)
				config.tooltip = config.tooltip();

			config.update = null;

			if (input.value) {
				mod_loading.show();

				mod_relay.Lawyer.getOne(
					mod_login.getUserId(),
					input.value
				)(doc => {
					mod_loading.hide();
					callback();

					input.value = doc ? doc.name : "";

					if (!doc)
						vergil(
							"<div style=color:var(--warning)>" +
							"That lawyer doesn't exist!" +
							"</div>",
							2800
						);
				});
			}

			input.removeAttribute("debounce");
		});
	}
};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	mod_datastore.init(lawyer_space, 128, 64, {
		getter: (skip, limit) =>
			mod_relay.Lawyer.get(
				mod_login.getUserId(),
				skip,
				limit,
				lawyer_search.value
			),
		key: doc => doc.key || doc.name.toUpperCase(),
		new: (doc, index) => {
			if (doc.name.search(/\S/) == -1)
				return;

			doc.key = doc.name.toUpperCase();

			let btn = doc.btn = q("#lawyer_space !label");
			btn.innerHTML = doc.name;

			if (index == null)
				lawyer_space.appendChild(btn);
			else
				lawyer_space.insertBefore(
					btn,
					lawyer_space.childNodes[index]
				);

			btn.addEventListener("click", event =>
				mod_edit_popup.show(
					"Lawyer",
					doc,
					mod_lawyer.callback.rename,
					mod_lawyer.callback.delete
				)
			);

			return doc;
		},
		remove: doc => {
			doc.btn.remove();

			return true;
		},
		move: (doc, index) => {
			if (index == null)
				lawyer_space.appendChild(doc.btn);
			else
				lawyer_space.insertBefore(
					doc.btn,
					lawyer_space.childNodes[index]
				);
		}
	})(mod_lawyer);

	mod_lawyer.setLawyerCallbacks(log_popup_lawyer);
}));

lawyer_search.addEventListener("input", _ => {
	mod_lawyer.flush();
	mod_lawyer.init();
});

lawyer_new.addEventListener("click", _ => {
	lawyer_popup_input.value = "";

	lawyer_popup.removeAttribute("invisible");
	lawyer_popup_input.focus();
});

tipper(lawyer_new, "New Lawyer");

spook.return();
