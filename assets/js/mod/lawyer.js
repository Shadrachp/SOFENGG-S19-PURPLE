/**
 * Enable functionality for the log's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js
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
	let add;

	let fn = _ => {
		let l = mod_lawyer.list[" "].filter(
			v => v.toUpperCase().indexOf(
				log_popup_lawyer.value.toUpperCase()
			) != -1
		);

		add = !mod_lawyer.list[log_popup_lawyer.value];

		if (add) l.unshift(txt);

		return l;
	};

	let l;

	if (mod_lawyer.list[log_popup_lawyer.value])
		l = mod_lawyer.list[" "];
	else {
		add = 1;
		l = mod_lawyer.list[" "].map(v => v);
		l.unshift(txt);
	}

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

				mod_lawyer.list[log_popup_lawyer.value] = [];
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
	if (!mod_lawyer.list[log_popup_lawyer.value])
		log_popup_lawyer.value = "";
});