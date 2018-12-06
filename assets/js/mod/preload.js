/**
 * Everything that will be shown before the database has connected.
 *
 * @author Llyme
 * @dependencies relay.js
**/

{
	// Don't let the user click on anything accidentally.
	document.body.style.pointerEvents = "none";

	const sub = [
		"Arranging archives...",
		"Fastening seatbelts...",
		"Gearing up...",
		"Harnessing energy...",
		"Getting ready...",
		"Testing tools...",
		"Oiling gears...",
		"Warming up...",
		"Gathering thoughts...",
		"Fueling up...",
		"Rehearsing statements...",
		"Waking up...",
		"Starting engines..."
	];
	const sub_dump = [];

	let f = _ => {
		// Stop if it's already connected.
		if (mod_relay.connected)
			return;

		let n = Math.floor(Math.random()*sub.length);
		preload_sub.innerHTML = sub[n];

		/* Add the oldest dumped text. We dump up to half of the total
		   texts to dramatically increase the chances of all of them
		   to appear, while decreasing the chances of the texts that
		   appear too often.
		*/
		if (sub_dump.length > sub.length)
			sub.push(sub_dump.shift());

		// Dump that text to prevent repeating the same text.
		sub_dump.push(sub.splice(n, 1)[0]);

		preload_sub.setAttribute("zoomie", 1);

		setTimeout(_ => {
			preload_sub.removeAttribute("zoomie");
			// Wait for a bit for the system to realize the changes.
			setTimeout(f, 100);
		}, 1600);
	};

	f();

	// Delete the preloading screen when the database has connected.
	spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
		preload_header.style.opacity = "0";
		preload_sub.style.color = "transparent";

		setTimeout(_ => {
			preload_header.innerHTML = "We're ready!";
			preload_header.style.opacity = "1";
		}, 200);

		setTimeout(_ => {
			preload.style.top =
				preload.style.left = "-150%";

			// Allow the user to click stuff.
			document.body.style.pointerEvents = "";

			// Focus on the username input.
			login_user.focus();
		}, 600);

		setTimeout(_ => preload.remove(), 3000);
	}));
}

spook.return();
