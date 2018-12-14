/**
 * Enable functionality for the lawyer popup window.
 *
 * @author Llyme
**/
const mod_lawyer_edit = {};

{
	let target;

	mod_lawyer_edit.show = doc => {
		target = doc;
		lawyer_edit_name.value = doc.name;

		lawyer_edit.removeAttribute("invisible");
	};

	lawyer_edit_name.addEventListener("change", _ => {
		let fn = txt => {
			lawyer_edit_name.value = target.name;

			vergil(txt);
		};

		lawyer_edit_name.value = lawyer_edit_name.value.trim();

		if (lawyer_edit_name.value == target.name)
			return;

		if (!lawyer_edit_name.value) return fn(
			"<label style=color:var(--warning)>" +
			"Please input something." +
			"</label>"
		);

		if (lawyer_edit_name.value.length < 2 ||
			lawyer_edit_name.value.length > 64) return fn(
			"<div style=color:var(--warning)>" +
			"Name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>"
		);

		mod_loading.show();

		mod_relay.Lawyer.edit(
			target._id,
			{name: lawyer_edit_name.value}
		)(flag => {
			mod_loading.hide();

			if (flag) {
				let key = lawyer_edit_name.value.toUpperCase();
				let key_old = target.key;

				mod_client.cases.flush();
				mod_client.cases.init();

				target.key = key;
				target.name = target.btn.innerHTML =
					lawyer_edit_name.value;

				mod_lawyer.move(key_old, key);

				vergil(
					"<label style=color:var(--success)>" +
					"Lawyer's name successfully changed!" +
					"</label>"
				);
			} else fn(
				"<label style=color:var(--warning)>" +
				"That name is already in use!" +
				"</label>"
			);
		});
	});

	lawyer_edit_delete.addEventListener("click", _ =>
		mod_delete_popup.show("lawyer", _ => {
			mod_relay.Lawyer.delete(target._id)(flag => {
				if (flag) {
					mod_lawyer.flush();
					mod_client.flush();
					mod_lawyer.init();
					mod_client.init();

					lawyer_edit.setAttribute("invisible", 1);

					vergil(
						"<label style=color:var(--success)>" +
						"Lawyer successfully deleted." +
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

lawyer_edit_close.addEventListener("click", _ =>
	lawyer_edit.setAttribute("invisible", 1)
);

spook.return();
