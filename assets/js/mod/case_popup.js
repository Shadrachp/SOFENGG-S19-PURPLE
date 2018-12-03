/**
 * Enable functionality for the case matter's popup window interface.
 *
 * @author Llyme
 * @dependencies relay.js, vergil.js, client.js, loading.js
**/
case_new.addEventListener("click", _ => {
	case_popup_input.value = "";

	case_popup.removeAttribute("invisible");
	case_popup_input.focus();
});

case_popup_input.addEventListener("keydown", event => {
	if (event.keyCode == 13)
		// Enter Key
		case_popup_create.click();
	else if (event.keyCode == 27)
		// Escape Key
		case_popup.setAttribute("invisible", 1);
});

case_popup_cancel.addEventListener("click", _ =>
	case_popup.setAttribute("invisible", 1)
);

case_popup_create.addEventListener("click", _ => {
	case_popup_input.value = case_popup_input.value.trim();

	if (!case_popup_input.value) return vergil(
		"<div style=color:var(--warning)>" +
		"Please input something." +
		"</div>"
	);

	if (case_popup_input.value.length < 2 ||
		case_popup_input.value.length > 64) return vergil(
		"<div style=color:var(--warning)>" +
		"Name must have at least <b>2 characters</b> and" +
		" up to <b>64 characters</b> at most." +
		"</div>"
	);

	mod_loading.show();

	mod_relay.Case.new({
		client: mod_client.selected._id,
		name: case_popup_input.value
	})(_id => {
		mod_loading.hide();

		if (_id) {
			let doc = mod_client.selected.cases.new({
				_id,
				name: case_popup_input.value
			});

			if (!doc)
				return;

			doc.btn.click();
			case_popup.setAttribute("invisible", 1);

			vergil(
				"<div style=color:var(--success);>" +
				"Case matter successfully created!" +
				"</div>",
				1800
			);
		} else vergil(
			"<div style=color:var(--warning)>" +
			"This case matter already exists!" +
			"</div>"
		);
	});
});

spook.return();
