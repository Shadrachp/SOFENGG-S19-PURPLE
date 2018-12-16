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
	},
	/* Constraints used to make sure that `time start` does not go
	   higher than `time end`, and vice-versa.
	*/
	time: [
		// Constraint for `time start`.
		(a, list) => {
			let b = lemon.time.toMilitary_split(
				list[1].value || list[1].placeholder
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
		(a, list) => {
			let b = lemon.time.toMilitary_split(
				list[0].value || list[0].placeholder
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
		(v, f, list, callback) => {
			let time = lemon.time.toMilitary_split(v);

			if (!time)
				return "";

			callback();

			return f(time, list);
		}
	],
	setTimeCallbacks: (list, callback) => {
		callback = callback || (_ => _);

		list.map((elm_a, i) => {
			let elm_b = list[1 - i];

			elm_a.addEventListener("focus", _ => {
				drool.time(
					elm_a,
					elm_a.value || elm_a.placeholder,
					v => {
						elm_a.value = v;
						elm_b.value = mod_log_popup.time[2](
							v,
							mod_log_popup.time[i],
							list,
							callback
						);
					}
				);
			});

			elm_a.addEventListener("change", _ => {
				elm_a.value = lemon.time.fixStandard(elm_a.value);
				elm_b.value = mod_log_popup.time[2](
					elm_a.value,
					mod_log_popup.time[i],
					list,
					callback
				);
			});
		});
	},
	parseElements: (_id,
					date_input,
					start_input,
					end_input,
					lawyer_input,
					code_input,
					desc_input,
					callback) => {
		let data = {
			date: new Date(
				date_input.value ||
				date_input.placeholder
			),
			time_start: lemon.time.toMilitary_split(
				start_input.value ||
				start_input.placeholder
			).reduce((a, b, i) => a + b * (!i ? 60 : 1), 0),
			time_end: lemon.time.toMilitary_split(
				end_input.value ||
				end_input.placeholder
			).reduce((a, b, i) => a + b * (!i ? 60 : 1), 0)
		};
		let txt = "";
		let n = 2;
		let fna = _ => {
			n--;

			if (n)
				return;

			mod_loading.hide();

			if (data.time_start == data.time_end)
				return vergil(
					"<div " +
					"style=color:var(--warning)>" +
					"You can't create a log with the " +
					"<b>starting time</b> the same as the " +
					"<b>ending time</b>!</div>",
					2600
				);

			if (txt.length)
				return vergil(
					"<div " +
					"style=color:var(--warning);text-align:left;>" +
					"Please fill up the entire form.<small>" + txt +
					"</small></div>",
					2600
				);

			mod_loading.show();

			let fn = docs => {
				for (let i in docs) {
					let doc = docs[i];

					if (doc._id != _id &&
						data.date.toJSON() === doc.date &&
						lemon.intersectRange(
							data.time_start, data.time_end,
							doc.time_start, doc.time_end
						) >= 0) {
						mod_loading.hide();

						return vergil(
							"<div style=color:var(--warning)>" +
							"An existing log's date and time " +
							"overlaps with this log!</div>",
							2600
						);
					}
				}

				let client = mod_client.selected;
				let case_space = client.cases.selected;

				callback(data, case_space, {
					case: case_space._id,
					date: data.date.toJSON(),
					time_start: data.time_start,
					time_end: data.time_end,
					lawyer: data.lawyer._id,
					codes: data.codes.map(doc => doc._id),
					description: data.description
				});
			};

			mod_client.selected.cases.selected.logs.getNotBilled()(fn);
		};
		let fnb = k => {
			if (k)
				txt = mod_log_popup.notif_empty[k] + txt;

			fna();
		};

		// Verify description.

		if (desc_input.innerText.search(/\S/) > -1)
			data.description = desc_input.innerText;
		else
			txt = mod_log_popup.notif_empty.description;


		// Verify lawyer.

		if (lawyer_input.value)
			mod_relay.Lawyer.getOne(
				mod_login.getUserId(),
				lawyer_input.value
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

		let list = code_input.getElementsByTagName("label");

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
				mod_relay.Code.getOne(list[i].innerText)(doc => {
					if (doc)
						codes.push(doc);

					fn();
				});
		} else
			fnb("code");
	}
};

// User clicked the log creation interface's submit button.
log_popup_ctrl_submit.addEventListener("click", _ => {
	mod_log_popup.parseElements(
		null,
		log_popup_date,
		log_popup_start,
		log_popup_end,
		log_popup_lawyer,
		log_popup_code,
		log_popup_desc,
		(data, case_space, doc) => {
			mod_relay.Log.new(doc)(_id => {
				mod_loading.hide();

				if (!_id)
					return vergil(
						"<div style=color:var(--warning);>" +
						"Log creation failed..." +
						"</div>",
						1800
					);

				document.activeElement.blur();
				log_popup.setAttribute("invisible", 1);

				data._id = _id;

				case_space.time += data.time_end - data.time_start;
				case_space.logs_count++;

				mod_relay.Case.edit(case_space._id, {
					time: case_space.time,
					logs_count: case_space.logs_count
				})(_ => _);

				case_space.logs.new(data, true);

				mod_info.stats_time_update(case_space.time);
				mod_info.stats_log_update(case_space.logs_count);

				vergil(
					"<div style=color:var(--success);>" +
					"Log successfully created!" +
					"</div>",
					1800
				);
			});
		}
	);
});

ctrl_log.addEventListener("click", _ => {
	if (!mod_client.selected.cases.selected)
		return vergil(
			"<div style=color:var(--warning)>" +
			"You need to create a <b>case matter</b> first!" +
			"</div>",
			2600
		);

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

spook.waitForChildren(_ =>
	mod_log_popup.setTimeCallbacks([log_popup_start, log_popup_end])
);

spook.return();
