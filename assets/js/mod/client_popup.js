/**
 * Enable functionality for the client's popup window interface.
 *
 * @author Llyme
 * @dependencies relay.js, vergil.js, client.js, loading.js
**/

client_popup_input.addEventListener("keydown", event => {
	if (event.keyCode == 13)
		// Enter Key
		client_popup_create.click();
	else if (event.keyCode == 27)
		// Escape Key
		client_popup.setAttribute("invisible", 1);
});

client_popup_cancel.addEventListener("click", _ =>
	client_popup.setAttribute("invisible", 1)
);

client_popup_create.addEventListener("click", _ => {
	// Name must contain SOMETHING. Don't make fun of me, please :(
	if (!client_popup_input.value &&
		client_popup_input.value.search(/\S/) == -1) return vergil(
		"<div style=color:var(--warning)>" +
		"Please input something." +
		"</div>"
	);

	// Name must have a length of 4 characters or more.
	if (client_popup_input.value.length < 4 ||
		client_popup_input.value.length > 64) return vergil(
		"<div style=color:var(--warning)>" +
		"Client's name must have at least <b>4 characters</b> and" +
		" up to <b>64 characters</b> at most." +
		"</div>"
	);

	/* Check if it's in the client's limited datastore. This is
	   different from the actual database which we store some of the
	   data here so we don't have to constantly nag the database for
	   queries.
	*/
	if (mod_client.list[client_popup_input.value.toUpperCase()])
		return vergil(
			"<div style=color:var(--warning)>" +
			"This client already exists!" +
			"</div>"
		);

	mod_loading.show();

	mod_relay.Client.new({name: client_popup_input.value})(flag => {
		mod_loading.hide();

		if (flag && mod_client.space_new(client_popup_input.value)) {
			client_search.value = "";

			mod_client.list[client_popup_input.value.toUpperCase()].btn
				.click();
			client_popup.setAttribute("invisible", 1);

			vergil(
				"<div style=color:var(--success);>" +
				"Client successfully created!" +
				"</div>",
				1800
			);
		} else vergil(
			"<div style=color:var(--warning)>" +
			"This client already exists!" +
			"</div>"
		);
	});
});

spook.return();
