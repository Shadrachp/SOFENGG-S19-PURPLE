/**
 * This is the big book of grimoire of documentations. Behold.
 *
 * HOW DO I CREATE MODULES/LIBRARIES?
 * - First off, make a file inside the `mod` folder (`lib` for
 *   libraries) and name it however you like. It's better if the name
 *   is shorter so it's faster to call it.
 *
 * HOW DO I DOCUMENT MY MODULES/LIBRARIES?
 * - Inside the file, make sure to put a documentation inside it and
 *   put your name/alias inside it at the end of the documentation
 *   starting with `@author`. A good example would be the
 *   `mod/client.js`.
 *
 * - If your module is calling functions or other stuff from another
 *   module or library, make sure to put which ones you are using by
 *   putting the name of the module/library in the documentation
 *   starting with `@dependencies`. A good example would be the
 *   `mod/client.js`.
 *
 * HOW DO I PROPERLY BE A GOOD BOY AT NAMING MY VARIABLES?
 * - If you plan on sharing public functions for other people to use,
 *   make a constant variable via `const`, and the at the beginning of
 *   that variable's name, make sure it has `mod_` (`lib_` for
 *   libraries) in it to prevent overwriting other people's work. Within
 *   that variable you are free to do whatever you want.
 *
 * HOW DO I MAKE MODIFICATIONS OUTSIDE OF MY MODULES/LIBRARIES?
 * - If there are variables that you're going to use, encapsulate it
 *   with braces! These modules/libraries are still connected to the
 *   global scope, and can overwrite existing variables.
 *
 * - Example,
 *   {
 *  	let hello = "there";
 *   }
 *
 * I'VE DONE EVERYTHING! HOW DO I CONNECT/LOAD IT TO THE APPLICATION?
 * - Before closing that nice looking module/library you got, make sure
 *   there's a "spook.return()" at the very bottom of it. This will
 *   give `spook.js` a signal that your module/library has finished
 *   loading.
 * - Neat! in the `index.js` you'll see the keyword `spook`. They're
 *   the ones loading modules/libraries into the framework. Just
 *   put your modules/libraries in one of them and make sure it has
 *   `mod/` at the start of the name of your modules (`lib/` for
 *   libraries).
 *
 * - The order is important! The first (top-most) will be loaded first.
 *   If your module/library is dependent to another module/library,
 *   make sure those guys load first, otherwise it would cause a lot
 *   of problems (worst case scenario, it would crash)!
 *
 * - And thats it, you're done! Great work.
 *
 * @author Llyme
**/

// Libraries `assets/js/lib`.
spook.load([
	"lib/lemon",
	"lib/qTiny",
	"lib/tipper",
	"lib/vergil",
	"lib/drool",
	"lib/viscount"
]);

// Modules `assets/js/mod`.
spook.load([
	"mod/loading",
	"mod/relay",
	"mod/menu",
	"mod/datastore",
	"mod/cosmetics",
	"mod/client",
	"mod/client_popup",
	"mod/info",
	"mod/lawyer",
	"mod/lawyer_popup",
	"mod/code",
	"mod/code_popup",
	"mod/log",
	"mod/log_popup",
	"mod/login",
	"mod/pref_popup",
	"mod/preload",
	"mod/sebastian" // Keep `sebastian.js` at the bottom.
]);

spook.done();
