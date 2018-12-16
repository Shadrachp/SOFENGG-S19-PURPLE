/**
 * Enable functionality for account window.
**/
const mod_account = {
	strings: {
		noValue:
			"<div style=color:var(--warning)>" +
			"Please input something.</div>",
		hasWhitespace:
			"<div style=color:var(--warning)>" +
			"Input cannot have <b>whitespaces</b>.</div>",
		invalidInput:
			"<div style=color:var(--warning)>" +
			"Input must have at least <b>4 characters</b> and" +
			" up to <b>64 characters</b> at most." +
			"</div>",
		usernameSuccess:
			"<div style=color:var(--success)>" +
			"Username successfully updated!" +
			"</div>",
		usernameExist:
			"<div style=color:var(--warning)>" +
			"This username <b>already exists</b>!" +
			"</div>",
		sameUsername:
			"<div style=color:var(--warning)>" +
			"This is the <b>same username</b>!" +
			"</div>",
		wrongConfirm:
			"<div style=color:var(--warning)>" +
			"<b>Password confirmation</b> is wrong!" +
			"</div>",
		broken:
			"<div style=color:var(--warning)>" +
			"It looks like something went wrong..." +
			"</div>",
		noConfirm:
			"<div style=color:var(--warning)>" +
			"We need to confirm your password first.</div>",
		samePassword:
			"<div style=color:var(--warning)>" +
			"This is the <b>same password</b>!" +
			"</div>",
		passwordSuccess:
			"<div style=color:var(--success)>" +
			"Password successfully updated!" +
			"</div>"
	}
};

ctrl_account.addEventListener("click", _ =>
	account.removeAttribute("invisible")
);

account_uname.addEventListener("click", _ => {
	mod_account_popup.show(_ => {
		account_popup_label.innerHTML = "New Username";
		account_popup_input.setAttribute("type", "text");

		return hide => {
			let value = account_popup_input.value =
				account_popup_input.value.trim();

			if (!value)
				return vergil(mod_account.strings.noValue, 1800);

			if (value.search(/\s/) != -1)
				return vergil(mod_account.strings.hasWhitespace, 1800);

			if (value.length < 4 || value.length > 64)
				return vergil(
					mod_account.strings.invalidInput,
					2600
				);


			let pword = account_popup_pword.value.trim();

			if (!pword)
				return vergil(mod_account.strings.noConfirm, 1800);


			mod_loading.show();

			mod_relay.User.edit(mod_login.getUserId(), pword, {
				username: value
			})(flag => {
				mod_loading.hide();

				switch(flag) {
					case 0:
						vergil(
							mod_account.strings.usernameSuccess,
							2600
						);
						hide();
						break;

					case 1:
						vergil(
							mod_account.strings.wrongConfirm,
							2600
						);
						break;

					case 2:
						vergil(
							mod_account.strings.usernameExist,
							2600
						);
						break;

					case 3:
						vergil(
							mod_account.strings.sameUsername,
							2600
						);
						break;

					case 5:
						vergil(
							mod_account.strings.broken,
							2600
						);
						break;
				}
			});
		};
	});
});

account_pword.addEventListener("click", _ => {
	mod_account_popup.show(_ => {
		account_popup_label.innerHTML = "New Password";
		account_popup_input.setAttribute("type", "password");

		return hide => {
			let value = account_popup_input.value =
				account_popup_input.value.trim();

			if (!value)
				return vergil(mod_account.strings.noValue, 1800);

			if (value.search(/\s/) != -1)
				return vergil(mod_account.strings.hasWhitespace, 1800);

			if (value.length < 4 || value.length > 64)
				return vergil(
					mod_account.strings.invalidInput,
					2600
				);


			let pword = account_popup_pword.value.trim();

			if (!pword)
				return vergil(mod_account.strings.noConfirm, 1800);


			mod_loading.show();

			mod_relay.User.edit(mod_login.getUserId(), pword, {
				password: value
			})(flag => {
				mod_loading.hide();

				switch(flag) {
					case 0:
						vergil(
							mod_account.strings.passwordSuccess,
							2600
						);
						hide();
						break;

					case 1:
						vergil(
							mod_account.strings.wrongConfirm,
							2600
						);
						break;

					case 4:
						vergil(
							mod_account.strings.samePassword,
							2600
						);
						break;

					case 5:
						vergil(
							mod_account.strings.broken,
							2600
						);
						break;
				}
			});
		};
	});
});

account_close.addEventListener("click", _ =>
	account.setAttribute("invisible", 1)
);

tipper(ctrl_account, "Edit Account");

spook.return();
