/**
 * Enable functionality for the preferences' popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, drool.js, client.js
**/
const mod_pref = {};
const mod_pref_lawyer = {};

mod_pref.setConversationID = _ => _;
mod_pref_lawyer.setConversationID = _ => _;

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

		// gets the current highlighted name
		let c = client_space.getElementsByTagName("label")
		var i = 0;
		let current = null;
		while (i<c.length) {
			if (c[i].getAttribute("selected") != null) {
				current = c[i];
				break;
			}
			i++;
		}
		// console.log("current: "+current.innerText);
		let currentName = current.innerText;

		if (!pref_popup_name.value) return fn(
			"<label style=color:var(--warning)>" +
			"Please input a name for the client." +
			"</label>"
		);

		if (pref_popup_name.value.length < 2 ||
			pref_popup_name.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>"
		);

		if (currentName == pref_popup_name.value)  return fn(
			"<label style=color:var(--warning)>" +
			"Client name is still the same. " + 
			"Name was not changed." +
			"</label>"
		);

		mod_loading.show();

		mod_client.edit(
			target.key,
			{name: pref_popup_name.value}
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = pref_popup_name.value.toUpperCase();
				let key_old = target.key;

				target.key = key;
				target.name = pref_popup_name.value;

				mod_client.move(key_old, key);

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

	pref_popup_danger.addEventListener("click", _ => {

		mod_loading.show();

		// Deletes the current highlighted name 
		// not necessarily the name in the text field.
		mod_client.delete(
			target.key
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = pref_popup_name.value.toUpperCase();
				
				// delete from interface
				mod_client.remove(key);
				
				// selects first client in interface if any
				let c = client_space.getElementsByTagName("label");
				if (c.length != 0)
					c[0].click();
				
				pref_popup.setAttribute("invisible", 1);

				vergil(
					"<label style=color:var(--success)>" +
					"Client successfully deleted!" +
					"</label>"
				);
			}
			else vergil(
				"<label style=color:var(--warning)>" +
				"Error! Unable to delete client." +
				"</label>"
			);
		});
	});

	mod_pref_lawyer.setConversationID = hash => conversation_id = hash;	

// 	// The lawyer that is being modified by the preferences window.
// 	let lawyer_target;

	mod_pref_lawyer.show = doc => {
		lawyer_target = doc;
		pref_popup_name_lawyer.value = doc.name;

		pref_popup.removeAttribute("invisible");
	};

	pref_popup_name_lawyer.addEventListener("change", _ => {
		let fn = txt => {
			pref_popup_name_lawyer.value = lawyer_target.name;

			vergil(txt);
		};

		pref_popup_name_lawyer.value = pref_popup_name_lawyer.value.trim();

		// gets the current highlighted name
		let c = lawyer_space.getElementsByTagName("label")
		var i = 0;
		let current = null;
		while (i<c.length) {
			if (c[i].getAttribute("selected") != null) {
				current = c[i];
				break;
			}
			i++;
		}
		// console.log("current: "+current.innerText);
		let currentName = current.innerText;

		if (!pref_popup_name_lawyer.value) return fn(
			"<label style=color:var(--warning)>" +
			"Please input something for the lawyer's name." +
			"</label>"
		);

		if (pref_popup_name_lawyer.value.length < 2 ||
			pref_popup_name_lawyer.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Lawyer's name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>"
		);

		if (currentName == pref_popup_name_lawyer.value)  return fn(
			"<label style=color:var(--warning)>" +
			"Lawyer name is still the same. " + 
			"Name was not changed." +
			"</label>"
		);

		mod_loading.show();

		mod_relay.Lawyer.edit(
			conversation_id,
			lawyer_target.key,
			{name: pref_popup_name_lawyer.value}
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = pref_popup_name_lawyer.value.toUpperCase();

				mod_lawyer.move(lawyer_target.key, key);

				lawyer_target.key = key;
				lawyer_target.name = pref_popup_name_lawyer.value;

				if (lawyer_target.hasOwnProperty("btn"))
					lawyer_target.btn.innerHTML =
						pref_popup_name_lawyer.value +
						mod_lawyer.pref_btn;

				vergil(
					"<label style=color:var(--success)>" +
					"Lawyer's name successfully changed!" +
					"</label>"
				);
			} else fn(
				"<label style=color:var(--warning)>" +
				"Lawyer: That name is already in use!" +
				"</label>"
			);
		});
	});

	pref_popup_delete_lawyer.addEventListener("click", _ => {

		mod_loading.show();

		// Deletes the current highlighted name 
		// not necessarily the name in the text field.
		mod_lawyer.delete(
			lawyer_target.key
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = pref_popup_name_lawyer.value.toUpperCase();
				
				// delete from interface
				mod_lawyer.remove(key);
				
				// selects first client in interface if any
				let c = lawyer_space.getElementsByTagName("label")
				if (c.length != 0)
					c[0].click();
				
				pref_popup.setAttribute("invisible", 1);

				vergil(
					"<label style=color:var(--success)>" +
					"Lawyer successfully deleted!" +
					"</label>"
				);
			}
			else vergil(
				"<label style=color:var(--warning)>" +
				"Error! Unable to delete Lawyer." +
				"</label>"
			);
		});
	});
}

pref_popup_close.addEventListener("click", _ => {
	pref_popup.setAttribute("invisible", 1);
});

spook.return();
