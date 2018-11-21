/**
 * Library for the log interface.
 *
 * @author Llyme
 * @dependencies vergil.js, client.js
**/
const mod_log = {};

mod_log.setConversationID =
	mod_log.get =
	mod_log.new = _ => _;

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	let conversation_id;

	mod_log.setConversationID = hash => {
		conversation_id = hash;

		mod_log_popup.setConversationID(hash);
	};

	mod_log.new = (client_id, log_space) =>
		mod_datastore.init(log_space, 128, 64, {
			getter: (skip, limit) =>
				mod_relay.Log.get(client_id, skip, limit),
			key: doc => doc._id,
			new: (doc, index) => {
				doc.date = new Date(doc.date);

				let root = doc.root = q("!div");

				if (index != null)
					log_space.insertBefore(
						root,
						log_space.childNodes[index]
					);
				else
					log_space.appendChild(root);

				root.addEventListener("click", _ =>
					root.getAttribute("expand") ?
					root.removeAttribute("expand") :
					root.setAttribute("expand", 1)
				);


				// Date and time.

				let time = doc.time_end - doc.time_start;
				let l = {
					log_space_time: mod_info.stats_time_convert(
						doc.time_end - doc.time_start
					),
					log_space_date: doc.date.toLocaleDateString()
				};

				for (let i in l) {
					let v = q("!label class=" + i);
					v.innerHTML = l[i];
					root.appendChild(v);
				}


				// Lawyer, codes, and description.

				let div = q("!div");
				root.appendChild(div);

				l = {
					log_space_lawyer: [
						"label",
						doc.lawyer ? "<label>Lawyer</label>" +
							doc.lawyer.name :
						"<label style=color:var(--warning)>No Lawyer" +
						"</label>"
					],
					log_space_code: [
						"label",
						doc.codes ? "<label>Code</label>" +
							doc.codes.map(doc =>
								"<label>" + doc.code + "</label>"
							).join("") :
						"<label style=color:var(--warning)>No Code</label>"
					]
				};

				if (doc.description)
					l.log_space_desc = ["div", doc.description];

				for (let i in l) {
					let v = q("!" + l[0] + " class=" + i);
					v.innerHTML = l[i][1];

					div.appendChild(v);
				}

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
			sort: (a, b) => a > b
		})({});
}));

spook.return();
