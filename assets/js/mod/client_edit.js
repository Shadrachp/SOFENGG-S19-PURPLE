/**
 * Enable functionality for the client popup window.
 *
 * @author Llyme
**/
const mod_client_edit = {};

{
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
	mod_client_edit.show = doc => {
		target = doc;
		client_edit_name.value = doc.name;

		client_edit.removeAttribute("invisible");
	};

	client_edit_name.addEventListener("change", _ => {
		let fn = txt => {
			client_edit_name.value = target.name;

			vergil(txt);
		};

		client_edit_name.value = client_edit_name.value.trim();

		if (client_edit_name.value == target.name)
			return;

		if (!client_edit_name.value) return fn(
			"<label style=color:var(--warning)>" +
			"Please input something." +
			"</label>"
		);

		if (client_edit_name.value.length < 2 ||
			client_edit_name.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>"
		);

		mod_loading.show();

		mod_relay.Client.edit(target._id, {
			name: client_edit_name.value
		})(flag => {
			mod_loading.hide();

			if (flag) {
				let key = client_edit_name.value.toUpperCase();
				let key_old = target.key;

				target.key = key;
				info_name.innerHTML =
					target.name = client_edit_name.value;

				mod_client.move(key_old, key);

				if (target.hasOwnProperty("btn"))
					target.btn.innerHTML =
						client_edit_name.value +
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

	client_edit_delete.addEventListener("click", _ =>
		mod_delete_popup.show("client", _ => {
			mod_relay.Client.delete(target._id)(flag => {
				if (flag) {
					client_new.setAttribute("glow", 1);
					space_empty.removeAttribute("invisible");
					[info, ctrl_logs, case_space].forEach(v =>
						v.setAttribute("invisible", 1)
					);

					mod_client.flush();
					mod_client.init();

					client_edit.setAttribute("invisible", 1);

					vergil(
						"<label style=color:var(--success)>" +
						"Client successfully deleted." +
						"</label>"
					);
				} else vergil(
						"<label style=color:var(--warning)>" +
						"It looks like something went wrong..." +
						"</label>"
					);
			});
		})
	);
}

client_edit_close.addEventListener("click", _ =>
	client_edit.setAttribute("invisible", 1)
);

spook.return();
