/**
 * Enable functionality for the delete popup window.
 *
 * @author Llyme
**/
const mod_delete_popup = {};

{
	let fn;

	mod_delete_popup.show = (name, callback) => {
		fn = callback;
		delete_popup_name.innerHTML = name;

		delete_popup.removeAttribute("invisible");
	};

	delete_popup_yes.addEventListener("click", _ => {
		delete_popup.setAttribute("invisible", 1);
		fn();

		fn = null;
	});
}

delete_popup_no.addEventListener("click", _ =>
	delete_popup.setAttribute("invisible", 1)
);

spook.return();
