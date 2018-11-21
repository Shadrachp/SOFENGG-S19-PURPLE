/**
 * Enable functionality for the code's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, code.js, drool.js, tipper.js,
 * lawyer.js
**/
[code_popup_code, code_popup_desc].map(v =>
	v.addEventListener("keydown", event => {
		if (event.keyCode == 13)
			// Enter Key
			code_popup_create.click();
		else if (event.keyCode == 27)
			// Escape Key
			code_popup.setAttribute("invisible", 1);
	})
);

code_popup_cancel.addEventListener("click", _ =>
	code_popup.setAttribute("invisible", 1)
);

code_popup_create.addEventListener("click", _ => {
	// Code must contain SOMETHING.
	if (!code_popup_code.value ||
		code_popup_code.value.search(/\S/) == -1) return vergil(
		"<div style=color:var(--warning)>" +
		"Please input something for the <b>code</b>." +
		"</div>"
	);

	if (code_popup_code.value.length > 64) return vergil(
		"<div style=color:var(--warning)>" +
		"Code must have at least <b>1 character</b> and" +
		" up to <b>64 characters</b> at most." +
		"</div>"
	);

	let key = code_popup_code.value =
		code_popup_code.value.toUpperCase();

	/* Check if it's in the limited datastore. This is
	   different from the actual database which we store some of the
	   data here so we don't have to constantly nag the database for
	   queries.
	*/
	if (mod_code.get(key))
		return vergil(
			"<div style=color:var(--warning)>" +
			"This code already exists!" +
			"</div>"
		);

	mod_loading.show();

	let data = {
		code: key,
		description: code_popup_desc.value
	};

	mod_relay.Code.new(data)(flag => {
		mod_loading.hide();

		if (flag && mod_code.new(data)) {
			code_search.value = "";

			code_popup.setAttribute("invisible", 1);

			vergil(
				"<div style=color:var(--success);>" +
				"Code successfully created!" +
				"</div>",
				1800
			);
		} else vergil(
			"<div style=color:var(--warning)>" +
			"This code already exists!" +
			"</div>"
		);
	});
});

spook.return();
