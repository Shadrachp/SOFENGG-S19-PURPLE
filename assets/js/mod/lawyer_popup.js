/**
 * Enable functionality for the log's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, log.js, drool.js, tipper.js, sidebar.js,
 * lawyer.js
**/
const mod_lawyer_popup = {};

lawyer_popup_input.addEventListener("keydown", event => {
	if (event.keyCode == 13) {
		// Enter Key
		lawyer_popup_create.click();
		document.activeElement.blur();
	} else if (event.keyCode == 27) {
		// Escape Key
		lawyer_popup.setAttribute("invisible", 1);
		document.activeElement.blur();
	}
});

lawyer_popup_cancel.addEventListener("click", _ =>
	lawyer_popup.setAttribute("invisible", 1)
);

lawyer_popup_create.addEventListener("click", _ => {
	lawyer_popup_input.value = lawyer_popup_input.value.trim();

	// Name must contain SOMETHING.
	if (!lawyer_popup_input.value) return vergil(
		"<div style=color:var(--warning)>" +
		"Please input something." +
		"</div>"
	);

	if (lawyer_popup_input.value.length < 2 ||
		lawyer_popup_input.value.length > 64) return vergil(
		"<div style=color:var(--warning)>" +
		"Lawyer's name must have at least " +
		"<b>2 characters</b> and up to " +
		"<b>64 characters</b> at most." +
		"</div>"
	);

	let key = lawyer_popup_input.value.toUpperCase();

	/* Check if it's in the limited datastore. This is different
	   from the actual database which we store some of the
	   data here so we don't have to constantly nag the database
	   for queries.
	*/
	if (mod_lawyer.get(key))
		return vergil(
			"<div style=color:var(--warning)>" +
			"This lawyer already exists!" +
			"</div>"
		);

	mod_loading.show();

	mod_relay.Lawyer.new({
		user: mod_login.getUserId(),
		name: lawyer_popup_input.value
	})(_id => {
		mod_loading.hide();

		if (_id) {
			let doc = mod_lawyer.new({
				name: lawyer_popup_input.value
			});

			if (!doc)
				return;

			doc._id = _id;

			lawyer_search.value = "";

			lawyer_popup.setAttribute("invisible", 1);

			vergil(
				"<div style=color:var(--success);>" +
				"Lawyer successfully created!" +
				"</div>",
				1800
			);
		} else vergil(
			"<div style=color:var(--warning)>" +
			"This lawyer already exists!" +
			"</div>"
		);
	});
});

spook.return();
