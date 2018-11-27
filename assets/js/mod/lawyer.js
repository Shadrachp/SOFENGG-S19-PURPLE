/**
 * Enable functionality for the log's lawyer interface in the sidebar.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, tipper.js, sidebar.js
**/
const mod_lawyer = {
	tooltip_search:
		"<center small>" +
		"<b style=color:var(--info)>TYPE</b> to search for " +
		"<b style=color:var(--accent-lawyer)>LAWYERS</b>.<br>" +
		"</center>",
	tooltip_load:
		"<center small style=color:var(--info)>LOADING...</center>"
};

mod_lawyer.setConversationID = _ => _;

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	let conversation_id;

	mod_lawyer.setConversationID = hash => {
		conversation_id = hash;

		mod_lawyer_popup.setConversationID(hash);
		// Fill up the list with existing documents.
		mod_lawyer.init();
	};

	mod_datastore.init(lawyer_space, 128, 64, {
		getter: (skip, limit) =>
			mod_relay.Lawyer.get(
				conversation_id,
				skip,
				limit,
				lawyer_search.value
			),
		key: doc => doc.key || doc.name.toUpperCase(),
		new: (doc, index) => {
			if (doc.name.search(/\S/) == -1)
				return;

			let btn = doc.btn = q("#lawyer_space !label");
			btn.innerHTML = doc.name;

			if (index == null)
				lawyer_space.appendChild(btn);
			else
				lawyer_space.insertBefore(
					btn,
					lawyer_space.childNodes[index]
				);

			btn.addEventListener("click", event => {
			});

			return doc;
		},
		remove: doc => {
			doc.btn.remove();

			return true;
		},
		move: (doc, index) => {
			if (index == null)
				client_space.appendChild(doc.btn);
			else
				client_space.insertBefore(
					doc.btn,
					client_space.childNodes[index]
				);
		}
	})(mod_lawyer);




	//-- `log_popup_lawyer` --//

	let log_popup_lawyer_config = {
		debounce: {},
		tooltip: null,
		update: null,
		fn: _ => {
			if (!log_popup_lawyer_config.update)
				return;

			if (!log_popup_lawyer.value) {
				log_popup_lawyer_config.tooltip = drool.tooltip(
					log_popup_lawyer,
					mod_lawyer.tooltip_search,
					8
				);

				return log_popup_lawyer_config.update([]);
			}

			let key = log_popup_lawyer.value.toUpperCase();

			if (log_popup_lawyer_config.debounce.hasOwnProperty(key))
				return;

			log_popup_lawyer_config.debounce[key] = 1;

			if (log_popup_lawyer_config.tooltip)
				log_popup_lawyer_config.tooltip();

			if (key) {
				log_popup_lawyer_config.tooltip = drool.tooltip(
					log_popup_lawyer,
					mod_lawyer.tooltip_load,
					8
				);

				mod_relay.Lawyer.get(conversation_id, 0, 32, key)(docs => {
					delete log_popup_lawyer_config.debounce[key];

					if (log_popup_lawyer.value.toUpperCase() == key) {
						log_popup_lawyer_config.tooltip =
							log_popup_lawyer_config.tooltip();

						log_popup_lawyer_config.update(
							docs.map(doc => doc.name)
						);
					}
				});
			}
		}
	};

	log_popup_lawyer.addEventListener("focus", _ => {
		if (log_popup_lawyer.getAttribute("debounce"))
			return;

		log_popup_lawyer.setAttribute("debounce", 1);

		log_popup_lawyer_config.update = drool.list(
			log_popup_lawyer,
			[],
			(v, i) => {
				log_popup_lawyer.value = v;
				log_popup_lawyer.blur();

				return true;
			}
		);

		log_popup_lawyer_config.fn();
	});

	log_popup_lawyer.addEventListener(
		"input",
		log_popup_lawyer_config.fn
	);

	log_popup_lawyer.addEventListener("keydown", event =>
		(event.keyCode == 13 || event.keyCode == 27) ?
			log_popup_lawyer.blur() : 0
	);

	log_popup_lawyer.addEventListener("blur", _ => {
		if (log_popup_lawyer_config.tooltip)
			log_popup_lawyer_config.tooltip =
				log_popup_lawyer_config.tooltip();

		log_popup_lawyer_config.update = null;

		if (log_popup_lawyer.value) {
			mod_loading.show();

			mod_relay.Lawyer.getOne(
				conversation_id,
				log_popup_lawyer.value
			)(doc => {
				mod_loading.hide();

				log_popup_lawyer.value = doc ? doc.name : "";

				if (!doc)
					vergil(
						"<div style=color:var(--warning)>" +
						"That lawyer doesn't exist!" +
						"</div>",
						2800
					);
			});
		}

		log_popup_lawyer.removeAttribute("debounce");
	});
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
