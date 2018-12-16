/**
 * Enable functionality for the edit popup window.
 *
 * @author Llyme
**/
const mod_edit_popup = {
	string: {
		label_suffix: " Name",
		danger_prefix: "Delete This ",
		noinput:
			"<label style=color:var(--warning)>" +
			"Please input something." +
			"</label>",
		unrestricted:
			"<div style=color:var(--warning)>" +
			"Name must have at least <b>2 characters</b> " +
			"and up to <b>64 characters</b> at most." +
			"</div>",
		rename_success:
			"<label style=color:var(--success)>" +
			"Name successfully changed!" +
			"</label>",
		rename_fail:
			"<label style=color:var(--warning)>" +
			"That name is already in use!" +
			"</label>",
		delete_success:
			"<label style=color:var(--success)>" +
			"Successfully deleted." +
			"</label>",
		delete_fail:
			"<label style=color:var(--warning)>" +
			"It looks like something went wrong..." +
			"</label>"
	}
};

{
	let label, target, callback_rename, callback_delete;

	mod_edit_popup.show = (var_label,
						   var_target,
						   var_callback_rename,
						   var_callback_delete) => {
		label = var_label.toLowerCase();
		target = var_target;
		callback_rename = var_callback_rename;
		callback_delete = var_callback_delete;
		edit_popup_name.value = target.name;

		edit_popup_label.innerHTML =
			var_label + mod_edit_popup.string.label_suffix;
		edit_popup_danger.innerHTML =
			mod_edit_popup.string.danger_prefix + var_label;

		edit_popup.removeAttribute("invisible");
	};

	edit_popup_name.addEventListener("change", _ => {
		let fn = txt => {
			edit_popup_name.value = target.name;

			vergil(txt);
		};

		edit_popup_name.value = edit_popup_name.value.trim();

		if (edit_popup_name.value == target.name)
			return;

		if (!edit_popup_name.value) return fn(
			mod_edit_popup.string.noinput
		);

		if (edit_popup_name.value.length < 2 ||
			edit_popup_name.value.length > 64) return fn(
			mod_edit_popup.string.unrestricted
		);

		mod_loading.show();

		callback_rename({
			return: flag => {
				mod_loading.hide();

				vergil(
					flag ?
						mod_edit_popup.string.rename_success :
						mod_edit_popup.string.rename_fail
				);
			}
		}, target, edit_popup_name.value);
	});

	edit_popup_danger.addEventListener("click", _ =>
		mod_delete_popup.show(label, _ => {
			mod_loading.show();

			callback_delete({
				return: flag => {
					mod_loading.hide();

					if (flag)
						edit_popup.setAttribute("invisible", 1);

					vergil(
						flag ?
							mod_edit_popup.string.delete_success :
							mod_edit_popup.string.delete_fail
					);
				}
			}, target);
		})
	);
}

edit_popup_close.addEventListener("click", _ =>
	edit_popup.setAttribute("invisible", 1)
);

edit_popup_submit.addEventListener("click", _ =>
	edit_popup_close.click()
);

spook.return();
