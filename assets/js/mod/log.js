/**
 * Library for the log interface.
 *
 * @author Llyme
 * @dependencies vergil.js, client.js
**/
const mod_log = {};

/**
 * Create a new entry (GUI and data) for the client's log
 * interface.
 *
 * @param {String} client - the client's name in lowercase form.
 * This is used as the ID (temporary until database is built).
 * @param {String} date - date provided in string format.
 * @param {Array[String]} code - a list of codes provided.
 * @param {String} time_start - starting time for the log.
 * @param {String} time_end - ending time for the log.
 * @param {String} lawyer - the lawyer involved with the log.
 * @param {String} description - additional information for the
 * log.
**/
mod_log.space_new = (client,
					 date,
					 code,
					 time_start,
					 time_end,
					 lawyer,
					 description) => {
	let log_space = mod_client.list[client].log_space;
	let root = q("!div");

	log_space.insertBefore(root, log_space.childNodes[0]);

	let data = {
		date,
		code,
		time: [],
		lawyer,
		description
	};

	[time_start, time_end].map(v => {
		v = lemon.time.toMilitary_split(v);

		data.time.push(!v ? 0 : (v[0]*60 + v[1]));
	});

	mod_client.list[client].time += data.time[1] - data.time[0];
	mod_client.list[client].logs_count++;
	mod_client.list[client].logs.push(data);

	root.addEventListener("click", _ =>
		(root.getAttribute("expand") ?
		root.removeAttribute("expand") :
		root.setAttribute("expand", 1))
	);

	let l = {
		log_space_time: time_start + " to " + time_end,
		log_space_date: date
	};

	for (let i in l) {
		let v = q("!label class=" + i);
		v.innerHTML = l[i];
		root.appendChild(v);
	}

	let div = q("!div");
	root.appendChild(div);

	l = {
		log_space_lawyer:
			lawyer ? "<label>Lawyer</label>" + lawyer :
			"<label style=color:var(--warning)>No Lawyer</label>",
		log_space_code:
			code ? "<label>Code</label>" +
				code.map(v => "<label>" + v + "</label>")
					.join("") :
			"<label style=color:var(--warning)>No Code</label>"
	};

	for (let i in l) {
		let v = q("!label class=" + i);
		v.innerHTML = l[i];
		div.appendChild(v);
	}

	if (description) {
		let v = q("!div class=log_space_desc");
		v.innerHTML = description;
		div.appendChild(v);
	}


	/* Update the information interface. */
	mod_info.stats_time_update(mod_client.list[client].time);
	mod_info.stats_log_update(mod_client.list[client].logs_count);


	/* Hide the popup window and send a notification to the
	   user.
	*/
	log_popup.setAttribute("invisible", 1);

	vergil(
		"<div style=color:var(--success);>" +
		"Log successfully created!" +
		"</div>",
		1800
	)
};

spook.return();
