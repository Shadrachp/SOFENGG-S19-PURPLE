/**
 * Render all stuff that matters.
 *
 * @author Llyme
 * @dependencies qTiny.js
**/
const mod_cosmetics = {};

mod_cosmetics.checkbox = elm => {
	if (elm.childNodes.length)
		return elm;

	elm.appendChild(q("!div style=pointer-events:none"));

	elm.addEventListener("click", event => (
		event.target.getAttribute("active") != null ?
		event.target.removeAttribute("active") :
		event.target.setAttribute("active", 1)
	));

	return elm;
};

/* HTML is buggy and will sometimes let you focus on disabled elements.
   Of course, we prevent this.
*/
document.body.addEventListener("focusin", event => {
	if (event.target &&
		window.getComputedStyle(event.target).pointerEvents == "none") {
		event.target.blur();
		event.preventDefault();
		event.stopPropagation();
	}
});

spook.waitForChildren(_ => {
	//-- Checkboxes --//

	let l = document.querySelectorAll("[checkbox]");

	for (let i = 0; i < l.length; i++)
		mod_cosmetics.checkbox(l[i]);




	//-- Popup Windows --//

	// let list = document.querySelectorAll("[popup]");

	// for (let i = 0; i < list.length; i++)
	// 	list[i].querySelector("dim").addEventListener("mousedown", _ =>
	// 		list[i].setAttribute("invisible", 1)
	// 	);
});

spook.return();
