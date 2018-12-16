/**
 * Enable functionality for account edit popup window.
**/
const mod_account_popup = {};

{
	let callback;

	let hide = _ => {
		account_popup_input.value = "";
		account_popup_pword.value = "";

		account_popup.setAttribute("invisible", 1);

		let v = document.activeElement;

		if (v)
			v.blur();
	};

	mod_account_popup.show = var_callback => {
		callback = var_callback();

		account_popup.removeAttribute("invisible");
	};

	account_popup_submit.addEventListener("click", _ => callback(hide));

	account_popup_close.addEventListener("click", hide);
}
ctrl_account.addEventListener("click", _ =>
	account.removeAttribute("invisible")
);

account_close.addEventListener("click", _ =>
	account.setAttribute("invisible", 1)
);

tipper(ctrl_account, "Edit Account");

spook.return();
