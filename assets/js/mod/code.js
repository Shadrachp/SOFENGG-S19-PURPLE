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
		"</center>",
	setCodeCallbacks: (div, callback) => {
		callback = callback || (_ => _);

		let config = {
			list: {},
			debounce: {},
			tooltip: null,
			update: null,
			fn: (target, txt) => {
				if (!config.update)
					return;

				if (config.tooltip)
					config.tooltip();

				if (!txt) {
					config.tooltip = drool.tooltip(
						target,
						mod_code.tooltip_search,
						8
					);

					return config.update([]);
				}

				let key = txt.toUpperCase();

				if (config.debounce.hasOwnProperty(key))
					return;

				config.debounce[key] = 1;

				if (key) {
					config.tooltip = drool.tooltip(
						target,
						mod_code.tooltip_load,
						8
					);

					mod_relay.Code.get(0, 32, key)(docs => {
						delete config.debounce[key];

						config.list = docs;

						if (target.getAttribute("contenteditable") &&
							target.innerText.toUpperCase() == key) {
							config.tooltip =
								config.tooltip();

							config.update(docs.map(doc =>
								doc.description || doc.code
							));

							if (!docs.length)
								config.tooltip = drool.tooltip(
									target,
									mod_code.tooltip_empty,
									8
								);
						}
					});
				}
			}
		};

		div.addEventListener("focusin", event => {
			if (!event.target ||
				!event.target.getAttribute("contenteditable"))
				return;

			config.update = drool.list(
				div,
				[],
				null,
				(v, i) => {
					let code = config.list[i].code;
					let list = div.getElementsByTagName("label");

					if (list.length > 1)
						for (let n = 1; n < list.length; n++)
							if (list[n].innerText == code) {
								vergil(
									"<div " +
									"style=color:var(--warning)>" +
									"You can't add the same " +
									"code twice!</div>",
									2600
								);

								return;
							}

					event.target.innerHTML = code;
					event.target.removeAttribute("contenteditable");
					tipper(
						event.target,
						config.list[i].description,
						null,
						1
					);
					event.target.addEventListener(
						"click",
						function() { this.remove(); }
					);

					let btn = q("!label contenteditable=true");
					div.insertBefore(btn, div.childNodes[0]);
					btn.focus();

					callback();

					return true;
				}
			);

			config.fn(event.target, "");
		});

		div.addEventListener("focusout", event => {
			if (!event.target.getAttribute("contenteditable"))
				return;

			if (config.tooltip)
				config.tooltip =
					config.tooltip();

			event.target.innerHTML = "";
		});

		div.addEventListener("input", event => {
			if (event.inputType == "insertText" &&
					event.data == null ||
				event.inputType == "insertParagraph" ||
				event.inputType == "insertLineBreak") {
				event.target.innerHTML =
					event.target.innerText.replace(/\r?\n|\r/g, "");
			} else {
				config.fn(event.target, event.target.innerText);
				callback();
			}
		});
	}
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

			let btn = doc.btn = q("!label disabled=1");
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

	let codes = mod_excel.fromCSV("config/codes.csv");

	if (codes) {
		let n = codes.length + 1;
		let fn = _ => {
			n--;

			if (n)
				return;

			mod_code.init();
		};


		// Remove everything not inside the array.
		mod_relay.Code.trim(codes.map(v => v[0].toUpperCase()))(fn);


		// Create non-existent codes and update existing ones.
		codes.forEach(v => {
			mod_relay.Code.getOne(v[0])(doc => {
				if (doc) {
					if (doc.description != v[1])
						mod_relay.Code.edit(v[0], {
							description: v[1]
						})(fn);
					else
						fn();
				} else
					mod_relay.Code.new({
						code: v[0],
						description: v[1] || ""
					})(fn);
			});
		});
	} else
		mod_code.init();

	mod_code.setCodeCallbacks(log_popup_code);
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
