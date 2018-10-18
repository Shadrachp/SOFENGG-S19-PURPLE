/**
 * Enables login interface functionality.
 *
 * @author Llyme
**/

{
	let accept = _ => {
		// Hard-coded, for now.
		if (!login_user.value)
			return vergil (
				"<div style=color:var(--warning)>" +
				"Please input username and password." +
				"</div>",
				1800
			);
		else if (login_user.value != "admin")
			return vergil (
				"<div style=color:var(--warning)>" +
				"Username does not exist!" +
				"</div>",
				1800
			);
		else if (login_pwrd.value != "1234")
			return vergil (
				"<div style=color:var(--warning)>" +
				"Incorrect password!" +
				"</div>",
				1800
			);

		space.style.pointerEvents = "auto";
		space.style.display = "inherit";
		login.style.pointerEvents = "none";
		login.style.opacity = "0";

		setTimeout(_ => login.remove(), 1000);
	};

	let input = e => e.keyCode == 13 ? accept() : 0;

	login_user.addEventListener("keydown", input);
	login_pwrd.addEventListener("keydown", input);
	login_acpt.addEventListener("click", accept);
}