/**
 * Renders all checkbox tags and enable functionality.
 *
 * @author Llyme
 * @dependencies qTiny.js
**/

{
	let l = q("checkbox");

	for (let i = 0; i < l.length; i++) {
		l[i].appendChild(q("!div style=pointer-events:none"));

		l[i].addEventListener("click", event => (
			event.target.getAttribute("active") ?
			event.target.removeAttribute("active") :
			event.target.setAttribute("active", 1)
		));
	}
}