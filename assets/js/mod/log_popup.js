/**
 * Enable functionality for the log's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, lemon.js
**/

const mod_log_popup = {
	/** A proxy that feeds input through all constraints for creating a
	 * new log. Use this instead of 'mod_log.space_new'.
	**/
	new: _ => {
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
	}
}

log_ctrl_new.addEventListener("click", _ => {
	// Reset everything before revealing.
	log_popup_date.value = "";
	log_popup_start.value = "";
	log_popup_end.value = "";
	log_popup_lawyer.value = "";
	log_popup_code.innerHTML = "<label contenteditable=true></label>";
	log_popup_desc.innerHTML = "";

	log_popup.removeAttribute("invisible");
});

log_ctrl_sort.addEventListener("focus", _ => {
	drool.list(
		log_ctrl_sort,
		["Date", "Time", "Lawyer"],
		v => {
			log_ctrl_sort.innerHTML = "Sort by " + v;
			log_ctrl_sort.blur();

			return true;
		}
	);
});

// User clicked the log creation interface's cancel button.
log_popup_ctrl_cancel.addEventListener("click", _ => {
	log_popup.setAttribute("invisible", 1);
});

// User clicked the log creation interface's submit button.
log_popup_ctrl_submit.addEventListener("click", _ => {
	let l = [
		_ => mod_lawyer.list[log_popup_lawyer.value.toLowerCase()],
		_ => log_popup_code.getElementsByTagName("label").length > 1,
		_ => log_popup_desc.innerText.search(/\S/) > -1
	];

	let txt = ["* Lawyer", "* Code", "* Description"]
		.filter((v, i) => !l[i]())
		.join("<br>");

	if (txt.length)
		vergil(
			"<div style=color:var(--warning);text-align:left;>" +
			"Please fill up the entire form.<br><small>" + txt +
			"</small></div>",
			2600
		);
	else
		mod_log_popup.new();

	// if (txt) {
	// 	log_new_popup_label.innerHTML = txt;
	// 	log_new_popup.removeAttribute("invisible");
	// } else
	// 	mod_log_popup.new();
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

{
	/* Constraints used to make sure that `time start` does not go
	   higher than `time end`, and vice-versa.
	*/
	let l = [
		// Constraint for `time start`.
		a => {
			let b = lemon.time.toMilitary_split(
				log_popup_end.value || log_popup_end.placeholder
			);

			if (b) {
				let an = a[0]*60 + a[1];
				let bn = b[0]*60 + b[1];

				if (an > bn) {
					an += an - bn;

					a = lemon.time.toStandard(
						Math.floor(an/60) + ":" +
						an%60
					);

					vergil(
						"<div style=color:var(--warning)>" +
						"Starting time was higher than the ending " +
						"time.<br><small>" +
						"Starting time is set to `" + a +
						"`.</small></div>",
						2600
					);

					return a;
				}
			}

			return lemon.time.toStandard(a[0] + ":" + a[1]);
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
					an += bn - an;

					a = lemon.time.toStandard(
						Math.floor(an/60) + ":" +
						an%60
					);

					vergil(
						"<div style=color:var(--warning)>" +
						"Ending time was lower than the starting " +
						"time.<br><small>" +
						"Ending time is set to `" + a +
						"`.</small></div>",
						2600
					);

					return a;
				}
			}

			return lemon.time.toStandard(a[0] + ":" + a[1]);
		},
		// Global constraint. This is applied to both of them.
		(v, f) => {
			let time = lemon.time.toMilitary_split(v);

			if (!time)
				return "";

			return f(time);
		}
	];

	[log_popup_start, log_popup_end].map((elm, n) => {
		elm.addEventListener("focus", _ => {
			drool.time(elm, elm.value || elm.placeholder, v =>
				v = elm.value = l[2](v, l[n])
			);
		});

		elm.addEventListener("change", _ => {
			elm.value = l[2](elm.value, l[n]);
		});
	});
}

log_popup_code.addEventListener("input", event => {
	if (event.data == null &&
		event.inputType != "deleteContentBackward") {
		if (event.target.innerText.search(/\S/) > -1) {
			event.target.innerHTML =
				event.target.innerText.replace(/\r?\n|\r/g, "");
			event.target.removeAttribute("contenteditable");
			event.target.addEventListener(
				"click",
				function() { this.remove(); }
			);

			let v = q("!label contenteditable=true");
			log_popup_code.insertBefore(
				v,
				log_popup_code.childNodes[0]
			);
			v.focus();
		} else {
			event.target.innerHTML = "";

			let fn = drool.tooltip(
				event.target,
				"<small style=color:var(--warning)>" +
				"Please input a non-whitespace character." +
				"</small>",
				8
			);

			setTimeout(_ => fn(), 1800);
		}
	}
});

// log_popup_code.addEventListener("keydown", event => {
// 	if (!event.altKey &&
// 		!event.ctrlKey &&
// 		event.key.length == 1 &&
// 		(
// 			!(
// 				(event.keyCode >= 48 && event.keyCode <= 57) ||
// 				(event.keyCode >= 96 && event.keyCode <= 105)
// 			) ||
// 			event.shiftKey
// 		)) {
// 		event.preventDefault();

// 		let fn = drool.tooltip(
// 			event.target,
// 			"<small style=color:var(--warning)>" +
// 			"Only numbers are allowed." +
// 			"</small>",
// 			8
// 		);

// 		setTimeout(_ => fn(), 1800);
// 	}
// });

log_popup_code.addEventListener("focusout", event => {
	if (!event.target.getAttribute("contenteditable"))
		return;

	if (event.target.innerText.search(/\S/) > -1) {
		let l = log_popup_code.getElementsByTagName("div");
		// event.target.innerHTML =
		// 	event.target.innerText.replace(/\S/g, "");
		event.target.removeAttribute("contenteditable");
		event.target.addEventListener(
			"click",
			function() { this.remove(); }
		);
		log_popup_code.insertBefore(
			q("!label contenteditable=true"),
			log_popup_code.childNodes[0]
		);
	} else
		event.target.innerHTML = "";
});

log_new_popup_cancel.addEventListener("click", _ =>
	log_new_popup.setAttribute("invisible", 1)
);

log_new_popup_submit.addEventListener("click", _ => {
	log_new_popup.setAttribute("invisible", 1);
	mod_log_popup.new();
});