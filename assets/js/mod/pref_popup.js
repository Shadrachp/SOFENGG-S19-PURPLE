/**
 * Enable functionality for the preferences' popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, drool.js, client.js
**/
const mod_pref = {};

mod_pref.setConversationID = _ => _;

{
	let conversation_id;

	mod_pref.setConversationID = hash => conversation_id = hash;

	// The client that is being modified by the preferences window.
	let target;

	/**
	 * Show the preference window and set the target. This is the only
	 * way to set the target.
	 *
	 * @param {String} name - the name of the client. Case-insensitive.
	 * Put the actual name (not the one with all uppercase) since it
	 * also sets the input value with this.
	**/
	mod_pref.show = doc => {
		target = doc;
		pref_popup_name.value = doc.name;

		pref_popup.removeAttribute("invisible");
	};

	pref_popup_name.addEventListener("change", _ => {
		let fn = txt => {
			pref_popup_name.value = target.name;

			vergil(txt);
		};

		pref_popup_name.value = pref_popup_name.value.trim();

		if (!pref_popup_name.value) return fn(
			"<label style=color:var(--warning)>" +
			"Please input something." +
			"</label>"
		);

		if (pref_popup_name.value.length < 2 ||
			pref_popup_name.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Client's name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>"
		);

		mod_loading.show();

		mod_relay.Client.edit(
			conversation_id,
			target.key,
			{
				name: pref_popup_name.value
			}
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = pref_popup_name.value.toUpperCase();

				// Migrate data to new name.

				mod_client.move(target.key, key);

				target.key = key;
				target.name = pref_popup_name.value;

				if (target.hasOwnProperty("btn"))
					target.btn.innerHTML =
						pref_popup_name.value +
						mod_client.pref_btn;

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
