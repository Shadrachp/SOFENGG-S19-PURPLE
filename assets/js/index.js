// Temporary credentials for testing purposes.
const var_login_user = "admin";
const var_login_pwrd = "1234";
/* List of clients. The key is the client's name in lowercase, and
   the value is the client's name that isn't converted to lowercase
   and the element associated with it.
*/
const var_client_list = {};
// List of visible clients on the screen. Used by the search bar.
var var_client_list_visible = [];
// Default filter key for the search bar.
var_client_list_visible.key = "";
// Currently selected client.
var var_client_selected;
const var_log_space_width = [
	96, // Date
	52, // Code
	80, // Duration
	144-8 // Handling Lawyer
];
const var_log_space_list = {};




//-- Setup `Login Section` functions. --//

function fn_login_acpt() {
	// if (login_user.value != var_login_user ||
	// 	login_pwrd.value != var_login_pwrd)
	// 	return;

	space.style.pointerEvents = "auto";
	space.style.display = "inherit";
	login.style.pointerEvents = "none";
	login.style.opacity = "0";

	setTimeout(_ => login.remove(), 1000);
}

function fn_login_input(e) {
	if (e.keyCode == 13)
		fn_login_acpt();
}

login_user.addEventListener("keydown", fn_login_input);
login_pwrd.addEventListener("keydown", fn_login_input);
login_acpt.addEventListener("click", fn_login_acpt);




//-- Setup `Client Section` functions. --//

/**
 * Create a new entry for the client space.
 * @param {string} txt - The name of the entry.
 * @returns {boolean} 'true' if successful, otherwise 'false'.
**/
function fn_client_space_new(txt) {
	let k = txt.toLowerCase();

	// Return 'false' if already created, or empty string.
	if (var_client_list[k] || !k)
		return false;

	let v = q("#client_space !label");
	v.innerHTML = txt;

	// Create entry for `log_space_data`.
	var_log_space_list[k] = [];
	var_log_space_list[k].log_space_data =
		q("#log_space !div class=log_space_data");

	var_client_list[k] = [txt, v];
	var_client_list_visible.push(k);

	if (!var_client_selected) {
		var_client_selected = k;

		var_log_space_list[k].log_space_data.style.display = "inherit";
		v.setAttribute("selected", 1);
	}

	v.addEventListener("click", _ => {
		var_log_space_list[var_client_selected]
			.log_space_data.style.display = "none";
		var_client_list[var_client_selected][1]
			.removeAttribute("selected", 1);

		var_client_selected = k;
		var_log_space_list[k].log_space_data.style.display = "inherit";
		v.setAttribute("selected", 1);
	});

	return true;
}

client_search.addEventListener("input", _ => {
	let k = client_search.value.toLowerCase();

	if (k.search(new RegExp(var_client_list_visible.key)) != -1) {
		var_client_list_visible.key = "^" + k;

		var_client_list_visible = var_client_list_visible.filter(v => {
			let d = v.indexOf(k) != -1;

			(
				!d ?
				var_client_list[v][1].style.display = "none" : 0
			);

			return d;
		});
	} else {
		var_client_list_visible = [];

		for (let v in var_client_list) if (v.indexOf(k) != -1) {
			var_client_list_visible.push(v);
			var_client_list[v][1].style.display = "block";
		} else {
			var_client_list[v][1].style.display = "none";
		}
	}

	var_client_list_visible.key = "^" + k;
});

client_new.addEventListener("click", _ =>
	client_new_popup.removeAttribute("invisible")
);




//-- Setup `client_new_popup` functions. --//

client_new_popup_cancel.addEventListener("click", _ =>
	client_new_popup.setAttribute("invisible", 1)
);

client_new_popup_create.addEventListener("click", _ => {
	if (fn_client_space_new(client_new_popup_input.value)) {
		var_client_list[client_new_popup_input.value.toLowerCase()][1]
			.click();
		client_new_popup.setAttribute("invisible", 1);
	} else vergil(
		client_new_popup_input.value ?
		"That client's name is already taken..." :
		"Please input a name for your client."
	);
});




//-- Setup `Log` functions. --//

function fn_log_space_resize() {
	let v = Math.max(176, log_input.clientHeight) + 16;
	log_space.style.top = v + "px";
	log_space.style.height = "calc(100% - " + v + "px)";
}

function fn_log_space_data_new(log_space_data,
							   date,
							   code,
							   duration,
							   lawyer,
							   description) {
	let div = q("!div");
	log_space_data.insertBefore(div, log_space_data.childNodes[0]);

	[date, code, duration, lawyer].map((v, i) => {
		let elm = q("!label");
		elm.innerHTML = v;
		elm.style.width = var_log_space_width[i] + "px";
		div.appendChild(elm);
	});

	if (description) {
		let elm = q("!div");
		elm.innerHTML = description;
		div.appendChild(elm);
	}

	div.appendChild(q("!sep"));
}

log_input.addEventListener("input", fn_log_space_resize);
fn_log_space_resize();

log_input_date.addEventListener("change", _ => {
	if (!log_input_date.value)
		return;

	let v = new Date(log_input_date.value);

	if (v == "Invalid Date") {
		log_input_date.value = "";
		log_input_date.setAttribute(
			"placeholder",
			new Date().toLocaleDateString()
		);
	} else
		log_input_date.value = v.toLocaleDateString();
});

log_input_date.setAttribute(
	"placeholder",
	new Date().toLocaleDateString()
);

log_input_duration.addEventListener("change", _ => {
	let v = log_input_duration.value;

	if (!v)
		return;

	let i = v.indexOf(":");

	if (i == -1) {
		v = Math.abs(Math.floor(Number(v)));
		// Only inputted minutes.

		if (!isNaN(v)) {
			let hr = Math.floor(v/60);
			let mn = v%60;

			log_input_duration.value =
				(hr < 10 ? "0" : "") + hr + ":" +
				("00" + mn).slice(-2);

			return;
		}
	} else {
		let mn = Math.abs(Math.floor(Number(v.substr(i+1))));
		let hr = Math.abs(Math.floor(Number(v.substr(0, i)))) +
			Math.floor(mn/60);

		if (!isNaN(hr + mn)) {
			log_input_duration.value =
				(hr < 10 ? "0" : "") + hr + ":" +
				("00" + mn%60).slice(-2);

			return;
		}
	}

	log_input_duration.value = "";
});

log_input_ctrl_submit.addEventListener("click", _ => {
	// Make sure there's actually a selected client to save to.
	if (var_client_selected) {
		log_input_date.setAttribute(
			"placeholder",
			new Date().toLocaleDateString()
		);

		fn_log_space_data_new(
			var_log_space_list[var_client_selected].log_space_data,
			log_input_date.value ||
				log_input_date.getAttribute("placeholder"),
			log_input_code.value,
			log_input_duration.value ||
				log_input_duration.getAttribute("placeholder"),
			log_input_lawyer.value,
			log_input_desc.innerText
		);
	}
});

{
	let div = q("#log_space !div");

	[
		"Date",
		"Code",
		"Time",
		"Handling Lawyer"
	].map((k, i) => {
		let v = q("!label");
		v.innerHTML = k;
		div.appendChild(v);

		v = q("!div");
		v.style.width = var_log_space_width[i] + "px";
		div.appendChild(v);
	});
}




//-- Initialization. --//
