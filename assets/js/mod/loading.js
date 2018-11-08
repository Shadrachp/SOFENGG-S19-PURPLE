/**
 * This lets you show the loading screen and disable the entire
 * interface.
 *
 * @author Llyme
**/
const mod_loading = {};

/**
 * Show the spinning loading thing and disable all controls.
**/
mod_loading.show = _ => {
	loading.removeAttribute("invisible");
	document.body.setAttribute("disabled", 1);
};

/**
 * Hide the spinning loading thing and enable all controls.
**/
mod_loading.hide = _ => {
	loading.setAttribute("invisible", 1);
	document.body.removeAttribute("disabled");
};

spook.return();
