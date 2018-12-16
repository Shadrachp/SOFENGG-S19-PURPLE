/**
 * Enable functionality for the case creation and interface.
 *
 * @author Llyme
**/
const mod_case = {
	strings: {
		log_space:
			"#log !div " +
			"class=log_space " +
			"scroll=1 " +
			"invisible=1",
		noSelectedCase:
			"<div style=color:var(--warning)>" +
			"You need to create a <b>case matter</b> first!</div>"
	},
	callback: {
		rename: (event, doc, name) =>
			mod_relay.Case.edit(doc._id, {name})(flag => {
				if (flag) {
					let key = name.toUpperCase();
					let key_old = doc.key;

					doc.key = key;
					doc.name = name;

					if (doc.hasOwnProperty("btn"))
						doc.btn.innerHTML = name;
				}

				event.return(flag);
			}),
		delete: (event, doc) =>
			mod_relay.Case.delete(doc._id)(flag => {
				if (flag) {
					mod_info.stats_time_update(0);
					mod_info.stats_log_update(0);

					mod_client.selected.cases.flush().init();
				}

				event.return(flag);
			})
	}
};

mod_case.get = mod_case.new = _ => _;

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	ctrl_pref.addEventListener("click", _ => {
		let client = mod_client.selected;

		if (client) {
			let casematter = client.cases.selected;

			if (casematter)
				return mod_edit_popup.show(
					"Case Matter",
					casematter,
					mod_case.callback.rename,
					mod_case.callback.delete
				);
		}

		vergil(mod_case.strings.noSelectedCase, 2800);
	});

	tipper(ctrl_pref, "Edit Case Matter");

	mod_case.new = (client_id, case_space) => {
		let cases = {selected: null};

		mod_datastore.init(case_space, 128, 64, {
			getter: (skip, limit) =>
				mod_relay.Case.get(client_id, skip, limit, ""),

			key: doc => doc.key || doc.name.toUpperCase(),

			new: (doc, index) => {
				if (doc.name.search(/\S/) == -1)
					return;

				let _id = doc._id;

				if (cases.selected &&
					cases.selected._id == _id) {
					for (let k in doc)
						cases.selected[k] == doc[k];

					doc = cases.selected;
				} else {
					doc.key = doc.name.toUpperCase();
					doc.time = doc.time == null ? 0 : doc.time;
					doc.logs_count =
						doc.logs_count == null ? 0 : doc.logs_count;
					doc.log_space = q(mod_case.strings.log_space)
					doc.logs = mod_log.new(doc._id, doc.log_space);

					doc.logs.init();
				}

				let btn = doc.btn = document.createElement("label");
				btn.innerHTML = doc.name;

				if (cases.selected == doc)
					btn.setAttribute("selected", 1);

				if (index == null)
					case_space.appendChild(btn);
				else
					case_space.insertBefore(
						btn,
						case_space.childNodes[index]
					);

				btn.addEventListener("click", event => {
					let prev = cases.selected;

					if (prev) {
						if (prev.hasOwnProperty("btn")) {
							prev.log_space
								.setAttribute("invisible", 1);
							prev.btn.removeAttribute("selected", 1);
						} else
							prev.log_space.remove();
					}

					mod_info.stats_time_update(doc.time);
					mod_info.stats_log_update(doc.logs_count);

					cases.selected = doc;
					btn.setAttribute("selected", 1);

					if (mod_client.selected._id == client_id)
						doc.log_space.removeAttribute("invisible");
				});

				if (!cases.selected)
					btn.click();

				return doc;
			},

			remove: doc => {
				doc.btn.remove();

				if (cases.selected != doc)
					doc.log_space.remove();
				else
					delete doc.btn;

				return true;
			},

			move: (doc, index) => {
				if (!doc.hasOwnProperty("btn"))
					return;

				if (index == null)
					case_space.appendChild(doc.btn);
				else
					case_space.insertBefore(
						doc.btn,
						case_space.childNodes[index]
					);
			},

			flush: _ => {
				if (!cases.selected)
					return;

				cases.selected.log_space.remove();
				cases.selected = null;
			}
		})(cases);

		return cases;
	};
}));

spook.return();
