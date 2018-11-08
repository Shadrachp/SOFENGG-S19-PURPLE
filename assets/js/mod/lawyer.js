/**
 * Enable functionality for the log's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, tipper.js
**/
const mod_lawyer = {
	/* List of created lawyers. The 'key/index' is the lawyer, while
	   the value is the list of logs that the lawyer is involved with.
	*/
	list: []
};
mod_lawyer.list[" "] = [];

// User focused on the lawyer input.
log_popup_lawyer.addEventListener("focus", _ => {
	let txt =
		"<div style=color:var(--info);text-align:center;>" +
		"Add This Lawyer" +
		"</div>";
	let l = mod_lawyer.list[" "];
	let add;

	if (!mod_lawyer.list[log_popup_lawyer.value.toLowerCase()]) {
		add = 1;
		l = l.map(v => v);
		l.unshift(txt);
	}

	let fn = _ => {
		let key = log_popup_lawyer.value.toLowerCase();
		let l = mod_lawyer.list[" "].filter(
			v => v.toLowerCase().indexOf(key) != -1
		);

		add = !mod_lawyer.list[key];

		if (add) l.unshift(txt);

		return l;
	};

	let update_fn;
	let update = drool.list(
		log_popup_lawyer,
		l,
		(v, i) => {
			if (!i && add) {
				if (log_popup_lawyer.value.search(/\S/) == -1)
					return vergil(
						"<div style=color:var(--warning)>" +
						"Please input a name." +
						"</div>"
					);

				// Use lowercase version as key/index.
				let key = log_popup_lawyer.value.toLowerCase();
				mod_lawyer.list[key] = [];
				// Store real name inside.
				mod_lawyer.list[key].name = log_popup_lawyer.value;
				// Dump name to collection.
				mod_lawyer.list[" "].push(log_popup_lawyer.value);

				vergil(
					"<div style=color:var(--success);>" +
					"Lawyer successfully added!" +
					"</div>",
					1800
				);
			} else
				log_popup_lawyer.value = v;

			log_popup_lawyer
				.removeEventListener("input", update_fn);
			log_popup_lawyer.blur();

			return true;
		}
	);
	update_fn = _ => update(fn());

	log_popup_lawyer.addEventListener("input", update_fn);
});

// User blurs focus from the lawyer input.
log_popup_lawyer.addEventListener("blur", _ => {
	if (!mod_lawyer.list[log_popup_lawyer.value.toLowerCase()])
		log_popup_lawyer.value = "";
});

tipper(lawyer_new, "New Lawyer")

spook.return();
