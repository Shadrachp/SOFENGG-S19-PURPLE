/**
 * A very spooky, sneaky, scary skeletal framework. The backbone
 * overlord of the modules and libraries.
 *
 * @author Llyme
**/

const spook = {
	/**
	 * Load a script module.
	 * @param {String | Array} v - The script/s to be loaded. File must
	 * be inside the `assets/js/` folder. If array, the left-most will
	 * be loaded first.
	 * @return {HTMLElement | Array[HTMLElement]} the tag/s created.
	**/
	load: v => {
		if (typeof(v) == "object")
			return v.map(v => spook.load(v));

		let s = document.createElement("script");
		s.src = "../js/" + v + ".js";
		s.async = false;

		document.head.appendChild(s);

		return s;
	}
};