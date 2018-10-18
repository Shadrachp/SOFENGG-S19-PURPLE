/**
 * Enable functionality for the client interface.
 *
 * @author Llyme
 * @dependencies qTiny.js, log.js, fridge.js, info.js
**/

const mod_client = {
	/* List of clients. The key is the client's name in lowercase, and
	   the value is the client's name that isn't converted to lowercase
	   and the element associated with it.
	*/
	list: {},
	// List of visible clients on the screen. Used by the search bar.
	list_visible: [],
	// Currently selected client.
	selected: null,
	/**
	 * Create a new entry for the client space.
	 * @param {string} txt - The name of the entry.
	 * @returns {boolean} 'true' if successful, otherwise 'false'.
	**/
	space_new: txt => {
		let k = txt.toLowerCase();


		// Return 'false' if already created, or empty string.

		if (mod_client.list[k] || k.search(/\S/) == -1)
			return false;


		/* Grab a UID from the fridge. */

		// let data = {
		// 	name: txt,
		// 	low: k // Store lowercase version.
		// };
		// let id = fridge.new(data);


		/* Draw the preference button. */

		let pref = q(
			"#client_space !img class=client_space_pref " +
			"src=../img/client_space_pref.png " +
			"draggable=false invisible=1 hidden=1"
		);
		tipper(pref, "Preferences");


		/* Draw the button element (We use a customized label since
		   it's a lot easier to render than the usual 'button'
		   element).
		*/

		let btn = q("#client_space !label");
		btn.innerHTML = txt;


		/* Create entry for `mod_log.space_list`. We use the lowercase
		   version of the client's name as the key.
		*/

		mod_log.space_list[k] = [];
		mod_log.space_list[k].log_space =
			q("#log !div class=log_space scroll=1");
		mod_log.space_list[k].time = 0; // Accumulated time in minutes.


		/* Make an index to grab the client's original name along with
		   the button element.
		*/

		mod_client.list[k] = {txt, btn, pref};
		mod_client.list_visible.push(k); // Tag as visible in the list.

		btn.addEventListener("click", _ => {
			/* If there was a previously selected client, hide their
			   log interface.
			*/

			if (mod_client.selected) {
				mod_log.space_list[mod_client.selected]
					.log_space.style.display = "none";
				mod_client.list[mod_client.selected].btn
					.removeAttribute("selected", 1);
				mod_client.list[mod_client.selected].pref
					.setAttribute("invisible", 1);
			}


			// Setup the information interface.

			info_name.innerHTML = txt;
			mod_info.stats_time_update(mod_log.space_list[k].time);
			mod_info.stats_log_update(mod_log.space_list[k]);


			// Tag as selected and show its log interface.

			mod_client.selected = k;
			mod_log.space_list[k].log_space.style.display = "inherit";
			btn.setAttribute("selected", 1);
			pref.removeAttribute("invisible");
		});


		/* Select this client automatically if this was the first
		   client.
		*/

		if (!mod_client.selected)
			btn.click();


		/* Hide the indication when there are no clients and reveal the
		   log interface.
		*/

		client_new.removeAttribute("glow");
		space_empty.setAttribute("invisible", 1);
		info_div.removeAttribute("invisible");
		log_ctrl.removeAttribute("invisible");

		return true;
	}
};

{
	// Default filter key for the search bar.
	mod_client.list_visible.key = "";

	client_search.addEventListener("input", _ => {
		let k = client_search.value.toLowerCase();

		if (k.search(new RegExp(mod_client.list_visible.key)) != -1) {
			mod_client.list_visible.key = "^" + k;

			mod_client.list_visible = mod_client.list_visible.filter(
				v => {
					let d = v.indexOf(k) != -1;

					(!d ? mod_client.list[v].btn.style.display =
						mod_client.list[v].pref.style.display = "none"
						: 0);

					return d;
				}
			);
		} else {
			mod_client.list_visible = [];

			for (let v in mod_client.list) if (v.indexOf(k) != -1) {
				mod_client.list_visible.push(v);
				mod_client.list[v].btn.style.display = "block";
				mod_client.list[v].pref.style.display = "inline-block";
			} else {
				mod_client.list[v].btn.style.display =
					mod_client.list[v].pref.style.display = "none";
			}
		}

		mod_client.list_visible.key = "^" + k;
	});

	client_new.addEventListener("click", _ => {
		client_popup_input.value = "";

		client_popup.removeAttribute("invisible");
		client_popup_input.focus();
	});
}