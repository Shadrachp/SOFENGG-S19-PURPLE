/**
 * Give them a good tooltip when things are too confusing!
 *
 * (Just search for the function name to see the documentation.)
 *
 * Functions:
 * - tipper()
 *
 * @author Llyme
**/

{
	let v = document.createElement("style");
	v.innerHTML = `
.tipper {
	opacity: 0.9;
	position: fixed;
	max-width: 320px;
	padding: 5px;
	padding-left: 10px;
	padding-right: 10px;
	border-radius: 4px;
	background-color: #000;
	color: #fff;
	text-align: center;
	z-index: 999;
	pointer-events: none;
}
	`;
	document.head.appendChild(v);
}

/**
 * Show a non-functional element to inform a user when the element
 * is hovered with the mouse.
 * @param {HTMLElement} elm - The element that triggers the message.
 * @param {String|Function} value - The message.
 * @param {Function({HTMLElement} elm)} cond - The condition fired
 * when hovering. The function must return a value that doesn't
 * equate to 'false' (zero, empty string, etc). `elm` is passed
 * as the argument.
 * @param {Integer} flag - 0 = None; 1 = Hide on focus or mouse down.
 * @return {HTMLElement} `elm`.
**/
const tipper = (elm, value, cond, flag) => {
	elm.addEventListener("mouseenter", event => {
		if (!cond || cond(elm)) {
			tipper.target = elm;
			tipper.div.innerHTML = typeof(value) == "function" ?
				value() : value;

			document.body.appendChild(tipper.div);
			tipper.move(event);
		}
	});

	elm.addEventListener("mouseleave", event => {
		// Make sure that the current focus is this element.
		if (tipper.target === elm) {
			tipper.target = null;

			tipper.div.remove();
		}
	});

	["mousedown", "focus"].map(v => elm.addEventListener(v, _ => {
		if (flag && tipper.target === elm) {
			tipper.target = null;

			tipper.div.remove();
		}
	}));

	return elm;
};

/**
 * Move the tooltip container.
 * @param {Object} event - The event.
**/
tipper.move = event => {
	if (!tipper.div.getAttribute("hidden")) {
		let x = tipper.div.clientWidth,
			y = tipper.div.clientHeight;

		tipper.div.style.left = Math.min(
			event.x + 2,
			innerWidth - tipper.div.clientWidth
		) + "px";
		tipper.div.style.top = Math.max(
			event.y - tipper.div.clientHeight - 2,
			0
		) + "px";
	}
};

tipper.div = document.createElement("_");
tipper.div.className = "tipper";

document.addEventListener("mousemove", tipper.move);

spook.return();
