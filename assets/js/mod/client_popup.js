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
	if (!client_popup_input.value ||
		client_popup_input.value.search(/\S/) == -1) return vergil(
		"<div style=color:var(--warning)>" +
		"Please input something." +
		"</div>"
	);

	if (client_popup_input.value.length < 2 ||
		client_popup_input.value.length > 64) return vergil(
		"<div style=color:var(--warning)>" +
		"Client's name must have at least <b>2 characters</b> and" +
		" up to <b>64 characters</b> at most." +
		"</div>"
	);

	let key = client_popup_input.value.toUpperCase();

	/* Check if it's in the limited datastore. This is
	   different from the actual database which we store some of the
	   data here so we don't have to constantly nag the database for
	   queries.
	*/
	if (mod_client.get(key))
		return vergil(
			"<div style=color:var(--warning)>" +
			"This client already exists!" +
			"</div>"
		);

	mod_loading.show();

	mod_relay.Client.new({name: client_popup_input.value})(flag => {
		mod_loading.hide();

		if (flag && mod_client.new({name: client_popup_input.value})) {
			client_search.value = "";

			console.log(key, mod_client.get(key));
			mod_client.get(key).btn.click();
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
