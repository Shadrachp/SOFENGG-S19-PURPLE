/**
 * Give logs to Bill. For billing. I'll see myself out.
 *
 * @author Llyme
**/
const mod_bill_popup = {
	headers: "<tr>" + [
			"",
			"Date",
			"Code",
			"Description of Work",
			"Handling Lawyer",
			"Hours Spent",
			"Rate",
			"Total Fees"
		].map(v => "<td>" + v + "</td>").join("") +
		"</tr>"
};

{
	let target;
	let writeTotal = update => {
		if (update) {
			target.elements.rate
				.forEach(v => v.innerHTML = target.rate);
			target.elements.fee.forEach(v =>
				v[0].innerHTML = v[1] * target.rate
			);
		}

		console.log(target)
		let fee = target.time * target.rate;

		bill_popup_vatfee.innerHTML = fee * target.vat;
		bill_popup_totalfee.innerHTML = fee;
		bill_popup_grandtotalfee.innerHTML = fee + fee * target.vat;
	};


	ctrl_bill.addEventListener("click", _ => {
		let client = mod_client.selected;
		let casematter = client.cases.selected;

		if (!casematter)
			return vergil(
				"<div style=color:var(--warning)>" +
				"You need to create a case matter first!</div>",
				2600
			);

		mod_loading.show();

		casematter.logs.getNotBilled()(docs => {
			mod_loading.hide();

			if (!docs.length)
				return vergil(
					"<div style=color:var(--warning)>" +
					"You don't have any logs that aren't billed!" +
					"</div>",
					2600
				);

			target = {
				client,
				case: casematter,
				logs: docs,
				date_from: new Date(docs[0].date).toLocaleDateString(),
				date_to: new Date(docs[docs.length - 1].date)
					.toLocaleDateString(),
				time: docs.length > 1 ? docs.reduce((a, b) =>
					(typeof(a) == "number" ?
						a : (a.time_end - a.time_start)/60) +
					(b.time_end - b.time_start)/60
				) : (docs[0].time_end - docs[0].time_start)/60,
				rate: 1000,
				vat: 12/100,
				included_count: docs.length
			};

			bill_popup_client.innerHTML = client.name;
			bill_popup_date.innerHTML =
				target.date_from + " - " + target.date_to;
			bill_popup_partner.value = "";
			bill_popup_rate.value = target.rate;
			bill_popup_vat.value = target.vat*100;

			writeTotal();
			mod_bill_popup.populate(docs);

			bill_popup.removeAttribute("invisible");
		});
	});


	bill_popup_partner.addEventListener("change", _ =>
		target.partner = bill_popup_partner.value =
			bill_popup_partner.value.trim()
	);

	bill_popup_rate.addEventListener("change", _ => {
		if (!bill_popup_rate.value || bill_popup_rate.value < 0)
			bill_popup_rate.value = 0;

		target.rate = bill_popup_rate.value;

		writeTotal(true);
	});

	bill_popup_vat.addEventListener("change", _ => {
		if (!bill_popup_vat.value || bill_popup_vat.value < 0)
			bill_popup_vat.value = 0;

		target.vat = bill_popup_vat.value/100;

		writeTotal();
	});


	bill_popup_cancel.addEventListener("click", _ => {
		target = null;

		bill_popup.setAttribute("invisible", 1);
	});

	bill_popup_submit.addEventListener("click", _ => {
		if (!target.included_count)
			return vergil(
				"<div style=color:var(--warning)>" +
				"There are no logs included in the bill!</div>",
				2600
			);

		if (!target.partner)
			return vergil(
				"<div style=color:var(--warning)>" +
				"Please input the <b>partner</b>'s name.</div>",
				2600
			);

		document.activeElement.blur();
		mod_loading.show();

		mod_excel.generate(target, flag => {
			if (flag == true) {
				let n = target.logs.length;
				let fn = _ => {
					n--;

					if (n)
						return;

					target = null;

					bill_popup.setAttribute("invisible", 1);

					vergil(
						"<div style=color:var(--success)>" +
						"Bill successfully created!</div>",
						2600
					);

					mod_loading.hide();
				};

				target.logs.forEach(doc => {
					if (!doc.include)
						return fn();

					mod_relay.Log.edit(doc._id, {
						billed: true
					})(fn);
				});
			} else {
				if (flag == false)
					vergil(
						"<div style=color:var(--warning)>" +
						"It looks like something went wrong...<br>" +
						"Maybe you were trying to overwrite a <b>" +
						"file being used</b>?</div>",
						2600
					);

				mod_loading.hide();
			}
		});
	});


	mod_bill_popup.populate = docs => {
		target.elements = {
			rate: [],
			fee: []
		};
		bill_popup_tbody.innerHTML = mod_bill_popup.headers;

		docs.forEach(doc => {
			doc.include = true;

			let hrs = (doc.time_end - doc.time_start)/60;

			let tr = q("!tr");
			bill_popup_tbody.appendChild(tr);

			[
				td => {
					let elm = mod_cosmetics.checkbox(
						q("!div checkbox=0 active=1")
					);

					elm.addEventListener("click", _ => {
						if (elm.getAttribute("active") != null) {
							doc.include = true;
							target.time += hrs;
							target.included_count++;

							tr.removeAttribute("exclude");
						} else {
							doc.include = false;
							target.time -= hrs;
							target.included_count--;

							tr.setAttribute("exclude", 1);
						}

						writeTotal();
					});

					td.setAttribute("short", 1);
					td.appendChild(elm);
				},
				new Date(doc.date).toLocaleDateString(),
				doc.codes.map(v => v.code).join(", "),
				td => {
					td.innerHTML = doc.description;

					td.setAttribute("long", 1);
				},
				doc.lawyer.name,
				hrs,
				td => {
					td.innerHTML = target.rate;

					target.elements.rate.push(td);
				},
				td => {
					td.innerHTML = hrs * target.rate;

					target.elements.fee.push([td, hrs]);
				}
			].forEach(v => {
				let td = q("!td");
				tr.appendChild(td);

				if (typeof(v) == "function")
					v(td);
				else
					td.innerHTML = v;
			});
		});
	};
}

spook.return();
