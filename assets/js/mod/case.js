/**
 * Enable functionality for the case creation and interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, info.js, relay.js, tipper.js, sidebar.js
**/
const mod_case = {
	pref_btn: "<img class=sidebar_pref_case "+
		"src=../img/sidebar_pref.png " +
		"draggable=false>"
};

mod_case.get = mod_case.new = _ => _;

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	mod_case.new = (client_id, case_space) => {
		let cases = {selected: null};

		// case delete
		mod_case.delete = (client_id, name) => 
		mod_relay.Case.delete(
			client_id,
			name
		);
		
		mod_case.edit = (client_id, name, properties) => 
		mod_relay.Case.edit(
			client_id,
			name,
			properties
		);

		mod_datastore.init(case_space, 128, 64, {
			getter: (skip, limit) =>
				mod_relay.Case.get(client_id, skip, limit, ""),

			key: doc => doc._id,

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
					doc.time = doc.time == null ? 0 : doc.time;
					doc.logs_count =
						doc.logs_count == null ? 0 : doc.logs_count;
					doc.log_space = q(
						"#log !div " +
						"class=log_space " +
						"scroll=1 " +
						"invisible=1"
					)
					doc.logs = mod_log.new(doc._id, doc.log_space);

					doc.logs.init();
				}

				let btn = doc.btn = q("!label");
				btn.innerHTML = doc.name + mod_case.pref_btn;

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
					if (event.target != btn) {
						mod_pref_lawyer.show(mod_lawyer.selected);
						mod_pref.show(mod_client.selected);
						return mod_pref_case.show(doc);					 
					}

					let prev = cases.selected;

					if (prev) {
						if (prev.hasOwnProperty("btn")) {
							prev.log_space.setAttribute("invisible", 1);
							prev.btn.removeAttribute("selected", 1);
						} else
							prev.log_space.remove();
					}

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
			},

			sort: (a, b) => a.name.toUpperCase() < b.name.toUpperCase()
		})(cases);

		return cases;
	};
}));

spook.return();
