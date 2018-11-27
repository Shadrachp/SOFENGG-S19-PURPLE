/**
 * Setup the code interface for the sidebar.
 *
 * @author Llyme
**/
const mod_code = {
	tooltip_search:
		"<center small>" +
		"<b style=color:var(--info)>TYPE</b> to search for " +
		"<b style=color:var(--accent-code)>CODES</b>.<br>" +
		"</center>",
	tooltip_load:
		"<center small style=color:var(--info)>LOADING...</center>",
	tooltip_empty:
		"<center small style=color:var(--warning)>" +
		"Nothing found... " +
		"</center>"
};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	mod_datastore.init(code_space, 128, 64, {
		getter: (skip, limit) =>
			mod_relay.Code.get(
				skip,
				limit,
				code_search.value
			),
		key: doc => doc.code,
		new: (doc, index) => {
			if (doc.code.search(/\S/) == -1)
				return;

			let btn = doc.btn = q("!label");
			btn.innerHTML =
				"<label>" + doc.code + "</label>" +
				(doc.description || "");

			if (index == null)
				code_space.appendChild(btn);
			else
				code_space.insertBefore(
					btn,
					code_space.childNodes[index]
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
				code_space.appendChild(doc.btn);
			else
				code_space.insertBefore(
					doc.btn,
					code_space.childNodes[index]
				);
		}
	})(mod_code);

	mod_code.init();




	//-- `log_popup_code` --//

	let log_popup_code_config = {
		list: {},
		debounce: {},
		tooltip: null,
		update: null,
		fn: (target, txt) => {
			if (!log_popup_code_config.update)
				return;

			if (log_popup_code_config.tooltip)
				log_popup_code_config.tooltip();

			if (!txt) {
				log_popup_code_config.tooltip = drool.tooltip(
					target,
					mod_code.tooltip_search,
					8
				);

				return log_popup_code_config.update([]);
			}

			let key = txt.toUpperCase();

			if (log_popup_code_config.debounce.hasOwnProperty(key))
				return;

			log_popup_code_config.debounce[key] = 1;

			if (key) {
				log_popup_code_config.tooltip = drool.tooltip(
					target,
					mod_code.tooltip_load,
					8
				);

				mod_relay.Code.get(0, 32, key)(docs => {
					delete log_popup_code_config.debounce[key];

					log_popup_code_config.list = docs;

					if (target.getAttribute("contenteditable") &&
						target.innerText.toUpperCase() == key) {
						log_popup_code_config.tooltip =
							log_popup_code_config.tooltip();

						log_popup_code_config.update(docs.map(doc =>
							doc.description || doc.code
						));

						if (!docs.length)
							log_popup_code_config.tooltip =
								drool.tooltip(
									target,
									mod_code.tooltip_empty,
									8
								);
					}
				});
			}
		}
	};

	log_popup_code.addEventListener("focusin", event => {
		if (!event.target ||
			!event.target.getAttribute("contenteditable"))
			return;

		log_popup_code_config.update = drool.list(
			log_popup_code,
			[],
			(v, i) => {
				let code = log_popup_code_config.list[i].code;
				let list = log_popup_code
					.getElementsByTagName("label");

				if (list.length > 1)
					for (let n = 1; n < list.length; n++)
						if (list[n].innerText == code) {
							vergil(
								"<div style=color:var(--warning)>" +
								"You can't add the same code twice!" +
								"</div>",
								2600
							);

							return;
						}

				event.target.innerHTML = code;

				event.target.removeAttribute("contenteditable");
				event.target.addEventListener(
					"click",
					function() { this.remove(); }
				);

				let btn = q("!label contenteditable=true");
				log_popup_code.insertBefore(
					btn,
					log_popup_code.childNodes[0]
				);
				btn.focus();

				return true;
			}
		);

		log_popup_code_config.fn(event.target, "");
	});

	log_popup_code.addEventListener("focusout", event => {
		if (!event.target.getAttribute("contenteditable"))
			return;

		if (log_popup_code_config.tooltip)
			log_popup_code_config.tooltip =
				log_popup_code_config.tooltip();

		event.target.innerHTML = "";
	});

	log_popup_code.addEventListener("input", event => {
		if (event.inputType == "insertText" && event.data == null ||
			event.inputType == "insertParagraph" ||
			event.inputType == "insertLineBreak") {
			event.target.innerHTML =
				event.target.innerText.replace(/\r?\n|\r/g, "");
		} else
			log_popup_code_config.fn(
				event.target,
				event.target.innerText
			);
	});
}));

code_search.addEventListener("input", _ => {
	mod_code.flush();
	mod_code.init();
});

code_new.addEventListener("click", _ => {
	code_popup_code.value = code_popup_desc.value = "";

	code_popup.removeAttribute("invisible");
	code_popup_code.focus();
});

spook.return();
