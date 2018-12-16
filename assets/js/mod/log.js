/**
 * Library for the log interface.
 *
 * @author Llyme
 * @dependencies client.js
**/
const mod_log = {
	strings: {
		sort: {
			prefix: {
				def: "<label style=display:block;text-align:center>",
				selected:
					"<label style=display:block;text-align:center;" +
					"color:var(--info);font-weight:bold>"
			},
			suffix: "</label>",
			content: ["Sort by Newest", "Sort by Oldest"]
		},
		noSelectedCase:
			"<div style=color:var(--warning)>" +
				"You need to create a <b>case matter</b> first!</div>"
	},
	sort: [
		[{
			_id: -1,
		}, {
			"lawyer.key": 1
		}], [{
			_id: 1,
		}, {
			"lawyer.key": 1
		}]
	],
	sort_fn: [
		(a, b) => {
			if (b.lawyer.name.toUpperCase() >
				a.lawyer.name.toUpperCase())
				return true;

			return b._id < a._id;
		},
		(a, b) => {
			if (b.lawyer.name.toUpperCase() >
				a.lawyer.name.toUpperCase())
				return true;

			return b._id > a._id;
		}
	]
};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	let ctrl_sort_fn;
	let sort = 0;

	ctrl_sort.addEventListener("click", event => {
		if (ctrl_sort_fn) {
			ctrl_sort_fn();

			ctrl_sort_fn = null;
		}

		if (!mod_client.selected ||
			!mod_client.selected.cases.selected)
			return vergil(mod_log.strings.noSelectedCase, 2600);

		ctrl_sort_fn = drool.list(
			ctrl_sort,
			mod_log.strings.sort.content.map((v, i) =>
				(sort == i ?
					mod_log.strings.sort.prefix.selected :
					mod_log.strings.sort.prefix.def) + v +
				mod_log.strings.sort.suffix
			),
			128,
			(_, i) => {
				sort = i;

				let cases = mod_client.selected.cases;
				cases.flush().init();

				return true;
			}
		);
	});

	tipper(ctrl_sort, "Sort Logs");

	mod_log.new = (case_id, log_space) => {
		let mod = {};

		mod.getNotBilled = _ =>
			mod_relay.Log.get(case_id, 0, 0, {
				billed: false
			}, [{
				date: -1,
				time_start: -1
			}]);

		mod_datastore.init(log_space, 128, 64, {
			getter: (skip, limit) =>
				mod_relay.Log.get(
					case_id,
					skip,
					limit,
					null,
					mod_log.sort[sort]
				),

			key: doc => doc._id,

			new: (doc, index) => {
				doc.date = new Date(doc.date);

				let root = doc.root = document.createElement("div");

				if (index != null)
					log_space.insertBefore(
						root,
						log_space.childNodes[index]
					);
				else
					log_space.appendChild(root);


				if (doc.billed)
					root.setAttribute("billed", 1);


				let pref = document.createElement("img");
				pref.className = "log_space_pref";
				pref.src = "../img/preferences_shadow_small.png";
				pref.setAttribute("draggable", false);
				root.appendChild(pref);


				root.addEventListener("click", event => {
					if (event.target == pref)
						mod_log_edit_popup.show(doc);
					else (
						root.getAttribute("expand") ?
						root.removeAttribute("expand") :
						root.setAttribute("expand", 1)
					);
				});


				let time = doc.time_end - doc.time_start;
				[[
					"log_space_time",
					mod_info.stats_time_convert(
						doc.time_end - doc.time_start
					) || "<b style=color:var(--warning)>" +
						"NO ACCUMULATED TIME</b>"
				], [
					"log_space_date",
					doc.date.toLocaleDateString()
				], [
					"log_space_code",
					label => {
						if (doc.codes.length) {
							doc.codes.forEach(doc => {
								let v = document
									.createElement("label");
								v.innerHTML = doc.code;
								label.appendChild(v);
								tipper(v, doc.description);
							});
						} else
							label.innerHTML = "<b>NO CODE</b>";
					}
				]].forEach(t => {
					let v = q("!label class=" + t[0]);

					if (typeof(t[1]) == "function")
						t[1](v);
					else
						v.innerHTML = t[1];

					root.appendChild(v);
				});


				let div = document.createElement("div");
				root.appendChild(div);

				let l = [[
					"log_space_range",
					"label",
					lemon.time.minutesToStandard(doc.time_start) +
						" to " +
						lemon.time.minutesToStandard(doc.time_end)
				], [
					"log_space_lawyer",
					"label",
					doc.lawyer.name ? "<label>Lawyer</label>" +
						doc.lawyer.name :
						"<label style=color:var(--warning)>No Lawyer" +
						"</label>"
				]];

				if (doc.description)
					l.push([
						"log_space_desc",
						"div",
						doc.description.replace(/\n/g, "<br>")
					]);

				l.forEach(t => {
					let v = q("!" + t[1] + " class=" + t[0]);
					v.innerHTML = t[2];

					div.appendChild(v);
				});

				return doc;
			},

			remove: doc => {
				doc.root.remove();

				return true;
			},

			move: (doc, index) => {
				if (index == null)
					log_space.appendChild(doc.btn);
				else
					log_space.insertBefore(
						doc.btn,
						log_space.childNodes[index]
					);
			},

			sort: (a, b) => mod_log.sort_fn[sort](a, b)
		})(mod);

		return mod;
	};
}));

spook.return();
