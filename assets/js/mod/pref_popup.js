/**
 * Enable functionality for the preferences' popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, drool.js, client.js
**/
const mod_pref = {};

{
	// The client that is being modified by the preferences window.
	let target = null;
	let target_upper = null;

	/**
	 * Show the preference window and set the target. This is the only
	 * way to set the target.
	 *
	 * @param {String} name - the name of the client. Case-insensitive.
	 * Put the actual name (not the one with all uppercase) since it
	 * also sets the input value with this.
	**/
	mod_pref.show = name => {
		target = name;
		target_upper = name.toUpperCase();

		pref_popup.removeAttribute("invisible");
		pref_popup_name.value = name;
	};

	pref_popup_name.addEventListener("change", _ => {
		let fn = txt => {
			pref_popup_name.value = target;

			vergil(txt);
		};

		// Name must contain SOMETHING. Don't make fun of me, please :(
		if (!pref_popup_name.value &&
			pref_popup_name.value.search(/\S/) == -1) return fn(
			"<label style=color:var(--warning)>" +
			"Please input something." +
			"</label>"
		);

		// Name must have a length of 4 characters or more.
		if (pref_popup_name.value.length < 4 ||
			pref_popup_name.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Client's name must have at least <b>4 characters</b> and" +
			" up to <b>64 characters</b> at most." +
			"</div>"
		);

		mod_relay.Client.edit(
			target,
			{
				name: pref_popup_name.value
			}
		)(flag => {
			if (flag) {
				let k = pref_popup_name.value.toUpperCase();

				// Migrate data to new name.
				mod_client.list[k] = mod_client.list[target_upper];
				mod_client.list[k].name = pref_popup_name.value;
				delete mod_client.list[target_upper];

				if (mod_client.list[k].hasOwnProperty("btn"))
					mod_client.list[k].btn.innerHTML =
						pref_popup_name.value;


				// Select the new name.
				target = info_name.innerHTML = pref_popup_name.value;
				target_upper = mod_client.selected = k;

				vergil(
					"<label style=color:var(--success)>" +
					"Client's name successfully changed!" +
					"</label>"
				);
			} else fn(
				"<label style=color:var(--warning)>" +
				"That name is already in use!" +
				"</label>"
			);
		});
	});
}

pref_popup_close.addEventListener("click", _ => {
	pref_popup.setAttribute("invisible", 1);
});

spook.return();
