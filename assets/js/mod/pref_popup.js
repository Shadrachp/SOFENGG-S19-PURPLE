/**
 * Enable functionality for the preferences' popup window interface.
 *
 * @author Llyme
 * @dependencies vergil.js, drool.js, client.js
**/

const mod_pref = {
	// The client that is being modified by the preferences window.
	target: null
};

pref_popup_close.addEventListener("click", _ => {
	pref_popup.setAttribute("invisible", 1);
});

pref_popup_name.addEventListener("change", _ => {
});