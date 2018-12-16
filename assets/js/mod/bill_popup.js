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
    const bill_by_lawyer = document.getElementById("bill_popup_bill_by_lawyer");
    let writeTotal = update => {
		if (update) {
			target.elements.rate
				.forEach(v => v.innerHTML = target.rate);
			target.elements.fee.forEach(v =>
				v[0].innerHTML = v[1] * target.rate
			);
		}

		let fee = target.time * target.rate;

		bill_popup_vatfee.innerHTML = fee * target.vat;
		bill_popup_totalfee.innerHTML = fee;
		bill_popup_grandtotalfee.innerHTML = fee + fee * target.vat;
	};


	ctrl_bill.addEventListener("click", _ => {
		let client = mod_client.selected;
		let casematter = client.cases.selected;
        while (bill_by_lawyer.firstChild)
            bill_by_lawyer.removeChild(bill_by_lawyer.firstChild);
		if (!casematter)
			return vergil(
				"<div style=color:var(--warning)>" +
				"You need to create a <b>case matter</b> first!</div>",
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
				date_from: new Date(docs[docs.length - 1].date)
					.toLocaleDateString(),
				date_to: new Date(docs[0].date).toLocaleDateString(),
				logs_count: docs.length,
				time: docs.length > 1 ? docs.reduce((a, b) =>
					(typeof(a) == "number" ?
						a : (a.time_end - a.time_start)/60) +
					(b.time_end - b.time_start)/60
				) : (docs[0].time_end - docs[0].time_start)/60,
				rate: 1000,
				vat: 12/100
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
			bill_popup_bill_by_lawyer.click();
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
		bill_popup_vat.value =
			Math.min(100, Math.max(bill_popup_vat.value, 0));

		target.vat = bill_popup_vat.value/100;

		writeTotal();
	});


	bill_popup_cancel.addEventListener("click", _ => {
		target = null;

		bill_popup.setAttribute("invisible", 1);
	});

	function BillByLawyer(logs) {
        const bill_by_lawyer = document.getElementById("bill_popup_bill_by_lawyer");
        const billme = bill_by_lawyer.options[bill_by_lawyer.selectedIndex].value.toString();
        const arr = [];
        while (logs.length){
            if (logs[logs.length - 1].lawyer.name === billme)
                arr.push(logs.pop());
            else logs.pop();
        }
        return arr;
        // return array.filter((logs, index, arr)=>{
        //     return logs === billme.options[billme.selectedIndex].value;
        // });
	}

	bill_popup_submit.addEventListener("click", _ => {
		if (!target.logs_count)
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
            target.logs = BillByLawyer(target.logs);
            if (flag == true) {
                let n = target.logs.length + 1;
                for (let i = 0; i < target.logs.length; i++) {
                	alert(target.logs[i].lawyer.name);
                }
				let fn = _ => {
					n--;

                    if (n)
						return;
					bill_popup.setAttribute("invisible", 1);

					target.case.logs.flush();
					target.case.logs.init();

					mod_info.stats_time_update(target.case.time);
					mod_info.stats_log_update(target.case.logs_count);

					target = null;

					vergil(
						"<div style=color:var(--success)>" +
						"Bill successfully created!</div>",
						2600
					);

					mod_loading.hide();
				};

				let time = 0;

				target.logs.forEach(doc => {
					if (!doc.include) {
						logs_count--;

						return fn();
					}

					time += doc.time_end - doc.time_start;

					mod_relay.Log.edit(doc._id, {
						billed: true
					})(fn);
				});

				target.case.logs_count -= target.logs_count;
				target.case.time -= time;

				mod_relay.Case.edit(target.case._id, {
					logs_count: target.case.logs_count,
					time: target.case.time
				})(fn);
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
        let prev = [];
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
			if(!prev.includes(doc.lawyer.name)) {
                bill_by_lawyer.innerHTML = "<option value =" + doc.lawyer.name + ">" + doc.lawyer.name + "</option>" + bill_by_lawyer.innerHTML;
                prev.push(doc.lawyer.name);
            }
			[
				td => {
					let elm = mod_cosmetics.checkbox(
						q("!div checkbox=0 active=1")
					);

					elm.addEventListener("click", _ => {
						if (elm.getAttribute("active") != null) {
							doc.include = true;
							target.time += hrs;
							target.logs_count++;

							tr.removeAttribute("exclude");
						} else {
							doc.include = false;
							target.time -= hrs;
							target.logs_count--;

							tr.setAttribute("exclude", 1);
						}

						target.date_from = target.date_to = null;

						for (let i = 0;
							i < docs.length &&
							(!target.date_from || !target.date_to);
							i++) {
							let to = docs[i];
							let from = docs[docs.length - i - 1];

							if (!target.date_to && to.include)
								target.date_to = new Date(to.date)
									.toLocaleDateString();

							if (!target.date_from &&
								docs[docs.length - i - 1].include)
								target.date_from = new Date(from.date)
									.toLocaleDateString();
						}

						bill_popup_date.innerHTML =
							target.date_from ? (
								target.date_from + " - " +
								target.date_to
							) : "N/A";

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

	bill_popup_bill_by_lawyer.addEventListener("change", _ => {
		// reset 
		let c = bill_popup_tbody;
		let rows = c.rows;
		let i = 1;
		while (i<rows.length) {
			let select = rows[i];
			let tds = select.getElementsByTagName("td");
			if (tds[0].firstElementChild.getAttribute("active") == 1 )
				tds[0].firstElementChild.click();
			i++;
		}

		// select based dropdown
		c = bill_popup_tbody;
		rows = c.rows;
		i = 1;
		while (i<rows.length) {
			let select = rows[i];
			let tds = select.getElementsByTagName("td");
			let index = bill_popup_bill_by_lawyer.selectedIndex;
			let str = bill_popup_bill_by_lawyer[index].innerText;
			if (tds[4].innerText == str) {
				tds[0].firstElementChild.click();
			}
			i++;
		}
	});
}

spook.return();
