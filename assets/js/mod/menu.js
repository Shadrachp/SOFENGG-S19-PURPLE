/**
 * Makes the menu actually work and do stuff.
 *
 * @author Llyme
 * @dependencies tipper.js
**/

{
	let list = [
		[menu_clients, client],
		[menu_lawyers, lawyer],
		[menu_codes, code]
	];
	let selected = list[0];

	list.map(v => v[0].addEventListener("click", _ => {
		if (selected) {
			selected[0].removeAttribute("selected");
			selected[1].setAttribute("invisible", 1);

			if (selected == v) {
				selected = null;

				sidebar.removeAttribute("toggle");
				info.removeAttribute("sidebar");
			} else {
				selected = v;

				v[0].setAttribute("selected", 1);
				v[1].removeAttribute("invisible");
			}
		} else {
			sidebar.setAttribute("toggle", 1);
			info.setAttribute("sidebar", 1);

			selected = v;

			v[0].setAttribute("selected", 1);
			v[1].removeAttribute("invisible");
		}
	}));
}

tipper(menu_clients, "Clients");
tipper(menu_lawyers, "Lawyers");
tipper(menu_codes, "Codes");

spook.return();
