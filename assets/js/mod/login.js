/**
 * Enables login interface functionality. This will also contain the
 * user credentials that will be essential whenever the application
 * requests data from the main process.
 *
 * @author Llyme
 * @dependencies loading.js
**/
const mod_login = {};

{
	let accept = _ => {
		// Make sure the user did put something in the inputs.
		if (!login_user.value && !login_pwrd.value)
			return vergil(
				"<div style=color:var(--warning)>" +
				"Please input username and password." +
				"</div>",
				1800
			);
		else if (!login_user.value)
			return vergil(
				"<div style=color:var(--warning)>" +
				"Please input the username." +
				"</div>",
				1800
			);
		else if (!login_pwrd.value)
			return vergil(
				"<div style=color:var(--warning)>" +
				"Please input the password." +
				"</div>",
				1800
			);

		// Show the loading screen if things take too long.
		mod_loading.show();

		mod_relay.User.get(
			login_user.value,
			login_pwrd.value
		)(id => {
			// Hide the loading screen.
			mod_loading.hide();

			switch(id) {
				case 0:
					return vergil(
						"<div style=color:var(--warning)>" +
						"Username does not exist!" +
						"</div>",
						1800
					);
				case 1:
					return vergil(
						"<div style=color:var(--warning)>" +
						"Incorrect password!" +
						"</div>",
						1800
					);
				default:
					if (!id)
						return;

					[mod_client, mod_lawyer, mod_log, mod_pref].forEach(v =>
						v.setConversationID(id)
					);

					// Show the `space` and hide the `login` screen.
					space.removeAttribute("hidden");
					login.setAttribute("invisible", 1);

					/* Clear these up so nobody would see it when
					   another user tries to login again in the same
					   window.
					*/
					login_user.value = login_pwrd = "";

					return;
			}
		});
	};

	let input = e => e.keyCode == 13 && accept();

	login_user.addEventListener("keydown", input);
	login_pwrd.addEventListener("keydown", input);
	login_acpt.addEventListener("click", accept);
}

spook.return();
