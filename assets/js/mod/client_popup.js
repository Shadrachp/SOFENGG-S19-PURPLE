/**
 * Enable functionality for the client's popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, client.js
**/

client_popup_input.addEventListener("keydown", event => {
	if (event.keyCode == 13)
		client_popup_create.click();
});

client_popup_cancel.addEventListener("click", _ =>
	client_popup.setAttribute("invisible", 1)
);

client_popup_create.addEventListener("click", _ => {
	if (mod_client.space_new(client_popup_input.value)) {
		client_search.value = "";
		mod_client.list[client_popup_input.value.toLowerCase()].btn
			.click();
		client_popup.setAttribute("invisible", 1);

		vergil(
			"<div style=color:var(--success);>" +
			"Client successfully created!" +
			"</div>",
			1800
		);
	} else vergil(
		"<div style=color:var(--warning);>" +
		(client_popup_input.value.search(/\S/) > -1 ?
		"Client name is already taken!" :
		"Please input a name for your client.") + "</div>",
		1800
	);
});