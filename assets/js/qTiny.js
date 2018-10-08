// Tiny jQuery. Faster way to do JS things, without jQuery.
const q = v => {
	let t = 1;
	v = v.split(" ");

	for (let i = 0; i < v.length && t; i++) if (!i) switch(v[i][0]) {
		case "#":
			t = document.getElementById(v[i].substr(1));
			break;
		case ".":
			t = document.getElementsByClassName(v[i].substr(1));
			break;
		case "!":
			let e = document.createElement(v[i].substr(1));

			v.shift();

			v.map(v => {
				v = v.split("=");

				if (v[0] == "delete")
					return setTimeout(_ => e.remove(), v[1]*1000);

				e.setAttribute(v[0], v[1]);
			});

			return e;
		default:
			t = document.getElementsByTagName(v[i]);
	} else {
		if (t instanceof HTMLCollection) t = t[0];

		switch(v[i][0]) {
			case "#":
				let l = t.childNodes;
				let n = v[i].substr(1);
				t = null;

				for (let i in l) if (l[i].id === n) {
					t = l[i];
					break;
				}

				break;
			case ".":
				t = t.getElementsByClassName(v[i].substr(1));
				break;
			case "!":
				let e = document.createElement(v[i].substr(1));

				v.slice(i+1).map(v => {
					v = v.split("=");

					if (v[0] == "delete")
						return setTimeout(_ => e.remove(), v[1]*1000);

					e.setAttribute(v[0], v[1]);
				});

				let p = q(v.slice(0, i).join(" "));

				if (p instanceof HTMLCollection)
					p = p[0];

				p.appendChild(e);

				return e;
			default:
				t = t.getElementsByTagName(v[i]);
		}
	}

	return t;
};