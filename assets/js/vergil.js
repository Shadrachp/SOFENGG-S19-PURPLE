/* A very 'ver'gilant message system.
*/

{
	let v = document.createElement("style");
	v.innerHTML = `

@keyframes vergil_anim {
	0% {
		opacity: 0;
		transform: translate(-50%, -10%);
	}

	100% {
		opacity: 1;
		transform: translateX(-50%);
	}
}

.vergil {
	position: absolute;
	top: 8px;
	left: 50%;
	min-width: 160px;
	max-width: 320px;
	padding: 16px 32px;
	border-radius: 16px;
	background-color: #fff;
	box-shadow: 0 0 1px #000;
	font-size: 18px;
	font-weight: lighter;
	text-align: center;
	transform: translateX(-50%);
	animation: vergil_anim 0.2s;
	z-index: 999;
	transition: all 0.2s;
	cursor: pointer;
	user-select: none;
}

.vergil:hover {
	border-radius: 8px;
}
	`;
	document.head.appendChild(v);
}


const vergil = (txt, lifespan) => {
	lifespan = lifespan || 3000;

	let v = document.createElement("_");
	v.className = "vergil";
	v.innerHTML = txt;
	document.body.appendChild(v);

	vergil.dump.map(l => {
		l[0] += v.clientHeight + 8;
		l[1].style.top = l[0] + "px";
	});

	let key = [8, v];
	vergil.dump.push(key);

	let d = _ => {
		d = null;
		let i = vergil.dump.indexOf(key);
		console.log(i)
		for (let n = i-1; n >= 0; n--) {
			vergil.dump[n][0] -= v.clientHeight + 8;
			vergil.dump[n][1].style.top = vergil.dump[n][0] + "px";
		}

		vergil.dump.splice(i, 1);

		v.style.pointerEvents = "none";
		v.style.transform =
			"translate(-50%, -10%)"
		v.style.opacity = 0;

		setTimeout(_ => v.remove(), 1000);
	};

	let timer = setTimeout(d, lifespan);

	v.addEventListener("mouseenter", _ => clearTimeout(timer));
	v.addEventListener("mouseleave", _ => {
		if (d)
			timer = setTimeout(d, lifespan)
	});

	v.addEventListener("click", _ => {
		d();
		clearTimeout(timer);
	});
};

vergil.dump = [];