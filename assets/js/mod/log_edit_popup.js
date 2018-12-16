/**
 * Enable functionality for the log edit popup window.
 *
 * @author Llyme
**/
const mod_log_edit_popup = {};

{
	let submitVisibleCallback = _ =>
		log_edit_popup_submit.removeAttribute("disabled");
	let target;

	mod_log_edit_popup.show = (var_target) => {
		target = var_target;

		log_edit_popup_date.value = target.date.toLocaleDateString();
		log_edit_popup_start.value =
			lemon.time.minutesToStandard(target.time_start);
		log_edit_popup_end.value =
			lemon.time.minutesToStandard(target.time_end);
		log_edit_popup_lawyer.value = target.lawyer.name;
		log_edit_popup_code.innerHTML =
			"<label contenteditable=true></label>";

		target.codes.forEach(v => {
			let label = document.createElement("label");
			label.innerHTML = v.code;
			tipper(label, v.description, null, 1);
			label.addEventListener(
				"click",
				function() {
					submitVisibleCallback();
					this.remove();
				}
			);
			log_edit_popup_code.appendChild(label);
		});

		log_edit_popup_desc.innerHTML = target.description;
		log_edit_popup_submit.setAttribute("disabled", 1);

		log_edit_popup.removeAttribute("invisible");
	};

	log_edit_popup_date.addEventListener("focus", _ => {
		drool.date(
			log_edit_popup_date,
			log_edit_popup_date.value ?
			new Date(log_edit_popup_date.value) : new Date(),
			v => {
				log_edit_popup_date.value = v.toLocaleDateString();
				log_edit_popup_date.blur();
				log_edit_popup_submit.removeAttribute("disabled");
			}
		);
	});

	log_edit_popup_date.addEventListener("change", _ => {
		if (!log_edit_popup_date.value)
			return log_edit_popup_date.value =
				target.date.toLocaleDateString();

		let v = new Date(log_edit_popup_date.value);

		if (v == "Invalid Date")
			return log_edit_popup_date.value =
				target.date.toLocaleDateString();

		log_edit_popup_date.value = v.toLocaleDateString();

		log_edit_popup_submit.removeAttribute("disabled");
	});

	mod_log_popup.setTimeCallbacks([
		log_edit_popup_start,
		log_edit_popup_end
	], submitVisibleCallback);

	[log_edit_popup_start, log_edit_popup_end, log_edit_popup_desc]
	.forEach(v => v.addEventListener("change", submitVisibleCallback));

	mod_lawyer.setLawyerCallbacks(
		log_edit_popup_lawyer,
		submitVisibleCallback
	);

	mod_code.setCodeCallbacks(
		log_edit_popup_code,
		submitVisibleCallback
	);

	log_edit_popup_submit.addEventListener("click", _ => {
		mod_log_popup.parseElements(
			target._id,
			log_edit_popup_date,
			log_edit_popup_start,
			log_edit_popup_end,
			log_edit_popup_lawyer,
			log_edit_popup_code,
			log_edit_popup_desc,
			(data, case_space, doc) => {
				mod_relay.Log.edit(target._id, doc)(flag => {
					if (!flag)
						return vergil(
							"<div style=color:var(--warning);>" +
							"Failed to update log..." +
							"</div>",
							1800
						);

					case_space.time +=
						data.time_end - data.time_start
						- target.time_end + target.time_start;

					mod_relay.Case.edit(case_space._id, {
						time: case_space.time
					})(_ => {
						mod_loading.hide();

						document.activeElement.blur();
						log_edit_popup.setAttribute("invisible", 1);

						case_space.logs.flush().init();
						mod_info.stats_time_update(case_space.time);

						vergil(
							"<div style=color:var(--success);>" +
							"Log successfully updated!" +
							"</div>",
							1800
						);
					});
				});
			}
		);
	});

	log_edit_popup_danger.addEventListener("click", _ =>
		mod_delete_popup.show("log", _ => {
			mod_loading.show();

			mod_relay.Log.delete(target._id)(flag => {
				mod_loading.hide();

				if (flag) {
					edit_popup.setAttribute("invisible", 1);
					log_edit_popup.setAttribute("invisible", 1);

					let case_space =
						mod_client.selected.cases.selected;
					case_space.time -=
						target.time_end - target.time_start;
					case_space.logs_count--;

					mod_info.stats_time_update(case_space.time);
					mod_info.stats_log_update(case_space.logs_count);

					mod_client.selected.cases.selected.logs
						.flush().init();
				}

				vergil(
					flag ?
						mod_edit_popup.string.delete_success :
						mod_edit_popup.string.delete_fail
				);
			})
		})
	);
}

log_edit_popup_close.addEventListener("click", _ =>
	log_edit_popup.setAttribute("invisible", 1)
);

spook.return();
