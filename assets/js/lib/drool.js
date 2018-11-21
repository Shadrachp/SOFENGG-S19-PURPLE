/**
 * King of dropdown menus.
 *
 * (Just search for the function name to see the documentation.)
 *
 * Functions:
 * - drool.tooltip()
 * - drool.list()
 * - drool.date()
 * - drool.relate() # THIS FUNCTION IS NOT MEANT TO BE USED.
 * - drool.link() # THIS FUNCTION IS NOT MEANT TO BE USED.
 *
 * @author Llyme
**/
const drool = {};

{
	let v = document.createElement("style");
	v.innerHTML = `

@keyframes drool_anim {
	0% {
		opacity: 0;
		transform: translateY(-8px);
	}

	100% {
		opacity: 1;
	}
}

.drool_tooltip {
	position: absolute;
	padding: 6px 8px;
	border-radius: 8px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	word-wrap: break-word;
	animation: drool_anim 0.2s;
	z-index: 999;
	transition: transform 0.2s, opacity 0.2s;
	user-select: none;
	pointer-events: none;
}

.drool_list {
	position: absolute;
	max-height: 256px;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	animation: drool_anim 0.2s;
	z-index: 999;
	transition: transform 0.2s, opacity 0.2s;
	overflow-y: auto;
	user-select: none;
}

.drool_list::-webkit-scrollbar {
	width: 8px;
}

.drool_list::-webkit-scrollbar-thumb {
	background-color: #3f3f3f;
	border-radius: 4px;
}

.drool_list::-webkit-scrollbar-thumb:hover {
	background-color: #000;
}

.drool_list > * {
	display: block;
	font-size: 14px;
	padding: 6px 8px;
	word-wrap: break-word;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_list > *:hover {
	background-color: #cfcfcf;
}

.drool_time {
	position: absolute;
	padding: 8px;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	animation: drool_anim 0.2s;
	z-index: 999;
	transition: transform 0.2s, opacity 0.2s;
}

.drool_time_meridiem {
	display: inline-block;
	width: 32px;
	padding: 2px;
	border-radius: 4px;
	text-align: center;
	background-color: #0f6fcf;
	color: #fff;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_time_meridiem:hover {
	filter: brightness(110%);
}

.drool_time_meridiem:active {
	filter: brightness(90%);
	transition: all 0.1s;
}

.drool_time_input {
	display: inline-block;
	width: 24px;
	padding: 2px 4px;
	margin-right: 8px;
	border-radius: 4px;
	outline: none;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	white-space: nowrap;
}

.drool_time_label {
	margin-right: 8px;
	pointer-events: none;
}

.drool_date {
	position: absolute;
	width: 288px;
	padding-top: 8px;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	animation: drool_anim 0.2s;
	z-index: 999;
	transition: transform 0.2s, opacity 0.2s;
	overflow-y: auto;
	user-select: none;
}

.drool_date > .drool_date_bar {
	display: block;
	margin: 8px;
	margin-top: 0;
	line-height: 32px;
	border-radius: 4px;
	text-align: center;
	font-size: 16px;
	background-color: #0f6fcf;
	color: #fff;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_date > .drool_date_bar:hover {
	filter: brightness(120%);
}

.drool_date > .drool_date_bar:active {
	filter: brightness(80%);
	transition: all 0.1s;
}

.drool_date > .drool_date_label {
	display: inline-block;
	width: 32px;
	margin-bottom: 8px;
	margin-left: 8px;
	text-align: center;
	font-size: 14px;
	font-weight: lighter;
	pointer-events: none;
}

.drool_date > .drool_date_btn0 {
	display: inline-block;
	width: 32px;
	line-height: 32px;
	margin-bottom: 8px;
	margin-left: 8px;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	text-align: center;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_date > .drool_date_btn0:hover {
	background-color: #cfcfcf;
}

.drool_date > .drool_date_btn1 {
	display: inline-block;
	width: 62px;
	line-height: 48px;
	margin-bottom: 8px;
	margin-left: 8px;
	border-radius: 4px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	text-align: center;
	font-size: 12px;
	font-weight: lighter;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_date > .drool_date_btn1:hover {
	background-color: #cfcfcf;
}

.drool_date > .drool_date_btn2 {
	display: inline-block;
	width: 62px;
	line-height: 48px;
	margin-bottom: 8px;
	margin-left: 8px;
	border-radius: 4px;
	background-color: #0f6fcf;
	color: #fff;
	box-shadow: 0 0 1px #000;
	text-align: center;
	font-size: 12px;
	font-weight: lighter;
	cursor: pointer;
	transition: all 0.2s;
}

.drool_date > .drool_date_btn2:hover {
	filter: brightness(120%);
}

.drool_date > .drool_date_btn2:active {
	filter: brightness(80%);
	transition: all 0.1s;
}

	`;

	document.head.appendChild(v);
}

/**
 * A non-functional display meant to inform the user.
 *
 * @param {HTMLElement} parent - The element that owns this
 * dropdown element.
 *
 * @param {String[]} txt - The text to be displayed.
 *
 * @param {Number} offset - The higher, the farther the tooltip
 * will be from the parent element.
 *
 * @return {Function} when called, will forcibly destroy the
 * dropdown element.
**/
drool.tooltip = (parent, txt, offset) => {
	offset = offset || 0;
	let rect = parent.getBoundingClientRect();
	let elm = document.createElement("_");
	document.body.appendChild(elm);

	elm.className = "drool_tooltip";
	elm.innerHTML = txt;
	elm.style.top = rect.bottom + offset + "px";
	elm.style.left =
		rect.left + rect.width/2 - elm.clientWidth/2 + "px";

	return drool.link(parent, elm);
};

/**
 * A list of items for you to select from.
 *
 * @param {HTMLElement} parent - The element that owns this
 * dropdown element.
 * @param {String[]} choices - A list of choices.
 * @param {Function} callback - The callback to be called when
 * the user clicks on a choice. Returing `true` in this function
 * will close the dropdown element.
 * @return {Function({String[]} choices)} when this function is
 * called, it will re-create all the choices with the given
 * parameter.
**/
drool.list = (parent, choices, callback) => {
	let pos = parent.getBoundingClientRect();
	let root = document.createElement("_");
	root.className = "drool_list";
	root.style.top = pos.bottom + "px";
	root.style.left = pos.left + "px";
	root.style.width = parent.clientWidth + "px";

	document.body.appendChild(root);

	let d = drool.link(parent, root);

	let fill = choices => {
		choices.map((v, i) => {
			let e = document.createElement("_");
			e.innerHTML = v;

			/* Only hide the dropdown element when the callback
			   returns `true`.
			*/
			e.addEventListener("click", _ => (
				callback(v, i) == true ? d() : 0
			));

			root.appendChild(e);
		});
	};

	fill(choices);

	return choices => {
		root.innerHTML = "";

		fill(choices);
	};
};

/**
 * Show an easier way to setup the time in 12-hour format.
 *
 * @param {HTMLElement} parent - The element that owns this
 * dropdown element.
 * @param {String} time - time in 12-hour format. If not a proper
 * format, it will use `01:00 AM` instead.
 * @param {Function({Date} date)} callback - This function will be
 * called when the user changes one of the inputs. The return value
 * will set the time forcibly (this goes beyond constraints and
 * can be set to a ridiculous value).
**/
drool.time = (parent, time, callback) => {
	let root = document.createElement("_");
	document.body.appendChild(root);
	root.className = "drool_time";

	// 0 = Hour; 1 = Minute; 2 = Meridiem (0 = AM; 1 = PM)
	let pref = ["01", "00", 0];
	/* This will execute the callback and set the `pref` values
	   if the callback function has a valid returned value.
	*/
	let ret = time => {
		time = callback(time);

		if (time) try {
			time = time.substr(time.search(/\d/));
			let i = time.indexOf(":");

			pref[0] = ("00" + Math.max(1, Math.min(12,
					Number(time.substr(0, i))
				))).slice(-2);

			time = time.substr(i + 1);

			i = time.search(/\D/);

			pref[1] = ("00" +
				Math.max(0, Math.min(59, Number(time.substr(0, i))))
				).slice(-2);

			pref[2] = time.indexOf("PM") > -1;

			input[0].innerHTML = pref[0];
			input[1].innerHTML = pref[1];
			meridiem.innerHTML = pref[2] ? "PM" : "AM";
		} catch(err) {}
	};

	if (time) try {
		time = time.substr(time.search(/\d/));
		let i = time.indexOf(":");

		pref[0] = ("00" +
			Math.max(1, Math.min(12, Number(time.substr(0, i))))
			).slice(-2);

		time = time.substr(i + 1);

		i = time.search(/\D/);

		pref[1] = ("00" +
			Math.max(0, Math.min(59, Number(time.substr(0, i))))
			).slice(-2);

		pref[2] = time.indexOf("PM") > -1;
	} catch(err) {}

	let input = [[1, 12], [0, 59]].map((l, i) => {
		if (i) {
			let elm = document.createElement("_");
			elm.className = "drool_time_label";
			elm.innerHTML = ":";

			root.appendChild(elm);
		}

		let elm = document.createElement("_");
		elm.className = "drool_time_input";
		elm.innerHTML = pref[i];

		elm.setAttribute("contenteditable", true);

		elm.addEventListener("input", event => {
			let n = Number(event.target.innerHTML);

			// Input is Not a Number.
			if (isNaN(n))
				return event.target.innerHTML = "00";

			if (event.target.innerHTML.length > 2)
				event.target.innerHTML =
					event.target.innerHTML.substr(0, 2);
		});

		elm.addEventListener("keydown", event => {
			if (event.keyCode == 13) {
				event.preventDefault();
				elm.blur();
				d();
			}

			if ([46, 8, 9, 27, 13, 110, 190]
				.indexOf(event.keyCode) > -1)
				return;

			if (!event.ctrlKey &&
				!event.altKey &&
				(event.keyCode < 48 || event.keyCode > 57) &&
				(event.keyCode < 96 || event.keyCode > 105))
				event.preventDefault();
		});

		elm.addEventListener("blur", event => {
			let n = Number(elm.innerText);
			n = Math.max(l[0], Math.min(l[1], n));

			elm.innerHTML = pref[i] = ("00" + n).slice(-2);

			ret(
				pref[0] + ":" + pref[1] +
				(pref[2] ? " PM" : " AM")
			);
		});

		root.appendChild(elm);

		return elm;
	});

	let meridiem = document.createElement("_");
	meridiem.className = "drool_time_meridiem";
	meridiem.innerHTML = pref[2] ? "PM" : "AM";
	root.appendChild(meridiem);

	meridiem.addEventListener("click", _ => {
		pref[2] = !pref[2];

		meridiem.innerHTML = pref[2] ? "PM" : "AM";

		ret(
			pref[0] + ":" + pref[1] +
			(pref[2] ? " PM" : " AM")
		);
	});

	let rect = parent.getBoundingClientRect();
	root.style.top = rect.bottom + 8 + "px";
	root.style.left =
		rect.left + rect.width/2 - root.clientWidth/2 + "px";

	let d = drool.link(parent, root);
};

/**
 * Show a sweet and heart-felt date calendar for the user
 * to select from <3.
 * @param {HTMLElement} parent - The element that owns this
 * dropdown element.
 * @param {Date} date - The date where the calendar will start
 * from. Setting to null will get the current date for today.
 * @param {Function({Date} date)} callback - This function will be
 * called when the user selects a date.
 * @return {Function} when called, will forcibly destroy the
 * dropdown element.
**/
drool.date = (parent, date, callback) => {
	date = date || new Date();
	date = [
		date.getMonth(),
		date.getFullYear()
	];

	let months = ["January", "February", "March", "April",
	"May", "June", "July", "August", "September", "October",
	"November", "December"];
	let rect = parent.getBoundingClientRect();
	let root = document.createElement("_");
	document.body.appendChild(root);
	root.className = "drool_date";
	root.style.top = rect.bottom + 8 + "px";
	root.style.left =
		rect.left + rect.width/2 - root.clientWidth/2 + "px";

	let d = drool.link(parent, root);

	let fn_a = _ => {
		root.innerHTML = "";

		let monthyear = document.createElement("_");
		monthyear.className = "drool_date_bar";
		monthyear.innerHTML =
			months[date[0]] + ", " +
			date[1];
		root.appendChild(monthyear);

		monthyear.addEventListener("click", _ => {
			fn_b();
		});

		["Su", "Mo", "Tu", "We",
		"Th", "Fr", "Sa"].map(v => {
			let week = document.createElement("_");
			week.className = "drool_date_label";
			week.innerHTML = v;
			root.appendChild(week);
		});

		let n = new Date(date[0]+1 + "/1/" + date[1]).getDay();

		for (let i = 0; i < n; i++) {
			let v = document.createElement("_");
			v.className = "drool_date_label";
			root.appendChild(v);
		}

		n = (
			date[0] <= 6 && (
				// February
				date[0] == 1 && (
					date[1]%4 &&
					28 || 29
				) || (
					// January to July
					date[0]%2 &&
					30 || 31
				)
			) || (
				date[0]%2 &&
				31 || 30
			)
		)

		for (let i = 1; i <= n; i++) {
			let n = i;
			let day = document.createElement("_");
			day.className = "drool_date_btn0";
			day.innerHTML = i;
			root.appendChild(day);

			day.addEventListener("click", _ => {
				callback(new Date(
					date[0]+1 + "/" +
					n + "/" +
					date[1]
				));

				d();
			});
		}
	};

	let fn_b = _ => {
		root.innerHTML = "";

		let year = document.createElement("_");
		year.className = "drool_date_bar";
		year.innerHTML = date[1];
		root.appendChild(year);

		year.addEventListener("click", _ => {
			fn_c();
		});

		months.map((v, i) => {
			let month = document.createElement("_");
			month.className = "drool_date_btn1";
			month.innerHTML = v;
			root.appendChild(month);

			month.addEventListener("click", _ => {
				date[0] = i;

				fn_a();
			});
		});
	};

	let fn_c = _ => {
		root.innerHTML = "";

		let start = 0;
		let n = date[1] - date[1]%14;

		if (n > 100) {
			let prev = document.createElement("_");
			prev.className = "drool_date_btn2";
			prev.innerHTML = "~" + (n - 1);
			root.appendChild(prev);

			prev.addEventListener("click", _ => {
				date[1] = n - 1;

				fn_c();
			});
		} else {
			start = 2;
		}

		for (let i = start; i < 14; i++) {
			let month = document.createElement("_");
			month.className = "drool_date_btn1";
			month.innerHTML = n + i;
			root.appendChild(month);

			month.addEventListener("click", _ => {
				date[1] = n + i;

				fn_b();
			});
		}

		let next = document.createElement("_");
		next.className = "drool_date_btn2";
		next.innerHTML = n + 14 + "~";
		root.appendChild(next);

		next.addEventListener("click", _ => {
			date[1] = n + 14;

			fn_c();
		});
	};

	fn_a();

	return d;
};

/**
 * See if the child element is within the parent element.
 * @param {HTMLElement} child - The child element.
 * @param {HTMLElement} parent - The parent element.
 * @return {Boolean} `true` if is child is contained by parent,
 * otherwise `false`.
**/
drool.relate = (child, parent) => {
	if (child == parent)
		return true;

	while (child.parentNode) {
		if (child.parentNode == parent)
			return true;

		child = child.parentNode;
	}

	return false;
};

/**
 * Makes it so that the menu will be destroyed if the user blurs
 * their focus on the parent or the menu. Focusing on the menu
 * will redirect the focus to the parent.
 * @param {HTMLElement} parent - The parent element.
 * @param {HTMLElement} menu - The dropdown menu element.
 * @return {Function()} when fired, it will destroy the menu
 * and the link.
**/
drool.link = (parent, menu) => {
	let d = _ => {
		d = _ => {};

		parent.removeEventListener("focusout", f0);
		menu.removeEventListener("focusout", f0);
		document.removeEventListener("mousedown", f1);

		menu.style.pointerEvents = "none";
		menu.style.animation = "none";
		menu.style.opacity = 0;
		menu.style.transform = "translateY(-8px)";

		setTimeout(_ => menu.remove(), 1000);
	};

	let f0 = event => {
		let v = event.relatedTarget ||
			document.activeElement ||
			document.elementFromPoint(
				event.clientX,
				event.clientY
			);

		if (!document.hasFocus() ||
			!drool.relate(v, menu) &&
			!drool.relate(v, parent))
			d();
	};

	let f1 = event => {
		let v = document.elementFromPoint(
			event.clientX,
			event.clientY
		);

		if (drool.relate(event.target, menu) &&
			(event.target.tagName != "INPUT" &&
			event.target.getAttribute("contenteditable") != "true")) {
			event.preventDefault();
		}
	}

	parent.addEventListener("focusout", f0);
	menu.addEventListener("focusout", f0);
	document.addEventListener("mousedown", f1);

	return d;
};

spook.return();
