/**
 * Enable functionality for the log's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, lemon.js
**/
const mod_log_popup = {
	notif_empty: {
		lawyer: "<br>* Lawyer",
		code: "<br>* Code",
		description: "<br>* Description"
	}
};

mod_log_popup.setConversationID = _ => _;

{
	let conversation_id;

	mod_log_popup.setConversationID = hash => conversation_id = hash;

	/** A proxy that feeds input through all constraints for creating a
	 * new log. Use this instead of 'mod_log.space_new'.
	**/
	mod_log_popup.new = _ => {
		// Make sure there's actually a selected client to save to.
		if (!mod_client.selected)
			return;

		log_popup_date.setAttribute(
			"placeholder",
			new Date().toLocaleDateString()
		);


		// Extract and convert code into array.
		let code = [];
		let l = log_popup_code.getElementsByTagName("label");

		for (let i = 0; i < l.length; i++)
			if (!l[i].getAttribute("contenteditable") &&
				l[i].innerText.search(/\S/) > -1)
				code.push(l[i].innerText);


		// Create log.
		mod_log.space_new(
			mod_client.selected,
			log_popup_date.value ||
				log_popup_date.getAttribute("placeholder"),
			code.length ? code : null,
			log_popup_start.value ||
				log_popup_start.getAttribute("placeholder"),
			log_popup_end.value ||
				log_popup_end.getAttribute("placeholder"),
			log_popup_lawyer.value,
			log_popup_desc.innerText
		);
	};

	// User clicked the log creation interface's submit button.
	log_popup_ctrl_submit.addEventListener("click", _ => {
		let data = {
			date: new Date(
				log_popup_date.value ||
				log_popup_date.placeholder
			),
			time_start: lemon.time.toMilitary_split(
				log_popup_start.value ||
				log_popup_start.placeholder
			).reduce((a, b, i) => a + b * (!i ? 60 : 1), 0),
			time_end: lemon.time.toMilitary_split(
				log_popup_end.value ||
				log_popup_end.placeholder
			).reduce((a, b, i) => a + b * (!i ? 60 : 1), 0)
		};
		let txt = "";
		let n = 2;
		let fna = _ => {
			n--;

			if (n)
				return;

			mod_loading.hide();

			if (txt.length)
				return vergil(
					"<div style=color:var(--warning);text-align:left;>" +
					"Please fill up the entire form.<small>" + txt +
					"</small></div>",
					2600
				);

			mod_loading.show();

			let client = mod_client.selected;

			mod_relay.Log.new({
				client: client._id,
				date: data.date,
				time_start: data.time_start,
				time_end: data.time_end,
				lawyer: data.lawyer._id,
				codes: data.codes.map(doc => doc._id),
				description: data.description
			})(_id => {
				mod_loading.hide();

				if (!_id)
					return vergil(
						"<div style=color:var(--warning);>" +
						"Log creation failed..." +
						"</div>",
						1800
					);

				log_popup.setAttribute("invisible", 1);

				data._id = _id;

				client.time += data.time_end - data.time_start;
				client.logs_count++;

				client.logs.new(data, true);

				mod_info.stats_time_update(client.time);
				mod_info.stats_log_update(client.logs_count);

				vergil(
					"<div style=color:var(--success);>" +
					"Log successfully created!" +
					"</div>",
					1800
				);
			});
		};
		let fnb = k => {
			if (k)
				txt = mod_log_popup.notif_empty[k] + txt;

			fna();
		};

		mod_loading.show();

		// Verify description.

		if (log_popup_desc.innerText.search(/\S/) > -1)
			data.description = log_popup_desc.innerText;
		else
			txt = mod_log_popup.notif_empty.description;


		// Verify lawyer.

		if (log_popup_lawyer.value)
			mod_relay.Lawyer.getOne(
				conversation_id,
				log_popup_lawyer.value
			)(doc => {
				if (doc)
					data.lawyer = {
						_id: doc._id,
						name: doc.name
					};

				fnb(!doc ? "lawyer" : null);
			});
		else
			fnb("lawyer");


		// Verify codes.

		let list = log_popup_code.getElementsByTagName("label");
		if (list.length > 1) {
			let codes = [];
			let count = list.length - 1;
			let fn = _ => {
				count--;

				if (count)
					return;

				data.codes = codes;

				fnb(codes.length < list.length - 1 ? "code" : null);
			};

			for (let i = 1; i < list.length; i++)
				mod_relay.Code.getOne(
					list[i].innerText
				)(doc => {
					if (doc)
						codes.push({
							_id: doc._id,
							code: doc.code
						});

					fn();
				});
		} else
			fnb("code");
	});
}

ctrl_log.addEventListener("click", _ => {
	// Reset everything before revealing.
	log_popup_date.value =
		log_popup_start.value =
		log_popup_end.value =
		log_popup_lawyer.value =
		log_popup_desc.innerHTML = "";
	log_popup_code.innerHTML = "<label contenteditable=true></label>";

	log_popup.removeAttribute("invisible");
});

// User clicked the log creation interface's cancel button.
log_popup_ctrl_cancel.addEventListener("click", _ => {
	log_popup.setAttribute("invisible", 1);
});

log_popup_date.addEventListener("focus", _ => {
	drool.date(
		log_popup_date,
		log_popup_date.value ?
		new Date(log_popup_date.value) : new Date(),
		v => {
			log_popup_date.value = v.toLocaleDateString();
			log_popup_date.blur();
		}
	);
});

log_popup_date.addEventListener("change", _ => {
	if (!log_popup_date.value)
		return;

	let v = new Date(log_popup_date.value);

	if (v == "Invalid Date") {
		log_popup_date.value = "";
		log_popup_date.setAttribute(
			"placeholder",
			new Date().toLocaleDateString()
		);
	} else
		log_popup_date.value = v.toLocaleDateString();
});

log_popup_date.setAttribute(
	"placeholder",
	new Date().toLocaleDateString()
);

spook.waitForChildren(_ => {
	/* Constraints used to make sure that `time start` does not go
	   higher than `time end`, and vice-versa.
	*/
	let fn = [
		// Constraint for `time start`.
		a => {
			let b = lemon.time.toMilitary_split(
				log_popup_end.value || log_popup_end.placeholder
			);

			if (b) {
				let an = a[0]*60 + a[1];
				let bn = b[0]*60 + b[1];

				if (an > bn) {
					a = lemon.time.toStandard(a[0] + ":" + a[1]);

					vergil(
						"<div style=color:var(--warning)>" +
						"Starting time was higher than the ending " +
						"time.<br><small>" +
						"Ending time is set to `" + a +
						"`.</small></div>",
						2600
					);

					return a;
				}
			}

			return lemon.time.toStandard(b[0] + ":" + b[1]);
		},

		// Constraint for `time end`.
		a => {
			let b = lemon.time.toMilitary_split(
				log_popup_start.value || log_popup_start.placeholder
			);

			if (b) {
				let an = a[0]*60 + a[1];
				let bn = b[0]*60 + b[1];

				if (an < bn) {
					a = lemon.time.toStandard(a[0] + ":" + a[1]);

					vergil(
						"<div style=color:var(--warning)>" +
						"Ending time was lower than the starting " +
						"time.<br><small>" +
						"Starting time is set to `" + a +
						"`.</small></div>",
						2600
					);

					return a;
				}
			}

			return lemon.time.toStandard(b[0] + ":" + b[1]);
		},
		// Global constraint. This is applied to both of them.
		(v, f) => {
			let time = lemon.time.toMilitary_split(v);

			if (!time)
				return "";

			return f(time);
		}
	];

	let list = [log_popup_start, log_popup_end];
	list.map((elm_a, i) => {
		let elm_b = list[1 - i];

		elm_a.addEventListener("focus", _ => {
			drool.time(elm_a, elm_a.value || elm_a.placeholder, v => {
				elm_a.value = v;
				elm_b.value = fn[2](v, fn[i]);
			});
		});

		elm_a.addEventListener("change", _ => {
			elm_a.value = lemon.time.fixStandard(elm_a.value);
			elm_b.value = fn[2](elm_a.value, fn[i]);
		});
	});
});

spook.return();
