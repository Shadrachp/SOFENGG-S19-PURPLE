/**
 * Excel stuff.
 *
 * @author Llyme
**/
const mod_excel = {};

{
	const electron = require("electron");
	const dialog = electron.remote.dialog;
	const self = electron.remote.getCurrentWindow();
	const fs = require("fs");
	const xlsx = require("xlsx");
	const better_xlsx = require("better-xlsx");

	const styles = {
		new: {},

		default: style => {
			style.align.v = "center";

			return style;
		},

		default_bold: style => {
			style.font.bold = true;
			style.align.v = "center";

			return style;
		},

		default_center: style => {
			style.align.h =
				style.align.v = "center";

			return style;
		},

		default_center_bold: style => {
			style.font.bold = true;
			style.align.h =
				style.align.v = "center";

			return style;
		},

		default_right: style => {
			style.align.h = "right";
			style.align.v = "center";

			return style;
		},

		header: style => {
			style.font.bold = true;
			style.fill.patternType = "solid";
			style.fill.fgColor =
				style.fill.bgColor = "00FFFF00";
			style.align.h =
				style.align.v = "center";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		accent: style => {
			style.font.bold = true;
			style.fill.patternType = "solid";
			style.fill.fgColor =
				style.fill.bgColor = "00CCFFFF";
			style.align.h =
				style.align.v = "center";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		accent_top: style => {
			style.font.bold = true;
			style.fill.patternType = "solid";
			style.fill.fgColor =
				style.fill.bgColor = "00CCFFFF";
			style.align.h =
				style.align.v = "center";
			style.border.top =
				style.border.left =
				style.border.right = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor = "00000000";

			return style;
		},

		accent_bottom: style => {
			style.fill.patternType = "solid";
			style.fill.fgColor = "00CCFFFF";
			style.fill.bgColor = "00CCFFFF";
			style.align.h =
				style.align.v = "center";
			style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell: style => {
			style.align.h = "left";
			style.align.v = "top";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_center: style => {
			style.align.h = "center";
			style.align.v = "top";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_right: style => {
			style.align.h = "right";
			style.align.v = "top";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_bottom: style => {
			style.font.bold = true;
			style.align.v = "bottom";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_bottom_right: style => {
			style.font.bold = true;
			style.align.h = "right";
			style.align.v = "bottom";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_gray: style => {
			style.fill.patternType = "solid";
			style.fill.fgColor = "00C0C0C0";
			style.fill.bgColor = "00C0C0C0";
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		cell_end: style => {
			style.border.top = "thin";
			style.border.topColor = "00000000";

			return style;
		},

		code_top: style => {
			style.align.h = "center";
			style.border.top =
				style.border.left =
				style.border.right = "thin";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor = "00000000";

			return style;
		},

		code_mid: style => {
			style.align.h = "center";
			style.border.left =
				style.border.right = "thin";
			style.border.leftColor =
				style.border.rightColor = "00000000";

			return style;
		},

		code_bot: style => {
			style.align.h = "center";
			style.border.left =
				style.border.right =
				style.border.bottom = "thin";
			style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		},

		thick_bold: style => {
			style.font.bold = true;
			style.border.top =
				style.border.left =
				style.border.right =
				style.border.bottom = "thick";
			style.border.topColor =
				style.border.leftColor =
				style.border.rightColor =
				style.border.bottomColor = "00000000";

			return style;
		}
	};


	for (let k in styles) {
		if (k != "new") {
			let fn = styles[k];
			styles.new[k] = _ => {
				let style = new better_xlsx.Style();
				style.font.name = "Arial";
				style.font.size = 11;

				return fn(style);
			};

			styles[k] = styles.new[k]();
		}
	}


	let generate_fn = (bill, path, callback) => {
		console.log(bill)
		let xlsx = better_xlsx;
		let file = new xlsx.File();
		let row, cell, style;


		let sheet = file.addSheet("Sheet1");

		[12, 10, 48, 12, 12, 14].forEach((n, i) => {
			let col = sheet.col(i);
			col.width = n + 0.7;
			col.style.font.size = 11;
		});

		[row => {
			cell = row.addCell();
			cell.value = "Time Sheet";
			cell.hMerge = 5;
			cell.style = styles.default_center_bold;

		}, row => {
			cell = row.addCell();
			cell.value = bill.client.name;
			cell.style = styles.default_bold;

		}, row => {
			cell = row.addCell();
			cell.value = bill.date_from + " - " + bill.date_to;
			cell.style = styles.default_bold;

		}, null,

		row => {
			for (let i = 0; i < 4; i++)
				cell = row.addCell();

			cell.value = bill.partner;
			cell.hMerge = 2;
			cell.style = styles.accent_top;

		}, row => {
			for (let i = 0; i < 4; i++)
				cell = row.addCell();

			cell.value = "Partner";
			cell.hMerge = 2;
			cell.style = styles.accent_bottom;

		}, null,

		null,

		row => {
			for (let i = 0; i < 4; i++)
				cell = row.addCell();

			cell.value = "Expenses";
			cell.hMerge = 2;
			cell.style = styles.accent;

		}, row => {
			["Date", "Code", "Description of Work",
			"Hours Spent", "Rate", "Total Fees"].forEach(v => {
				cell = row.addCell();
				cell.value = v;
				cell.style = styles.header;
			});

		}, row => {
			let start = end = 11;
			let height;

			bill.logs.forEach(doc => {
				if (!doc.include)
					return;

				height = doc.codes.length;

				[{
					style: styles.cell,
					value: new Date(doc.date).toLocaleDateString()
				}, {
					style: styles[height > 1 ?
						"code_top" : "cell_center"],
					value: height ? doc.codes[0].code : ""
				}, {
					style: styles.cell,
					value: doc.description
				}, {
					style: styles.cell_center,
					value: (doc.time_end - doc.time_start)/60,
					numFmt: "#,###.0",
					cellType: "TypeNumeric"
				}, {
					style: styles.cell_right,
					value: bill.rate,
					numFmt: "#,###.00",
					cellType: "TypeNumeric"
				}, {
					style: styles.new.cell_right(),
					formula: "D" + end + "*E" + end,
					numFmt: "#,###.00",
					cellType: "TypeFormula"
				}].forEach((t, i) => {
					cell = row.addCell();

					for (let k in t)
						cell[k] = t[k];

					if (height > 1 && i != 1)
						cell.vMerge = height - 1;
				});

				for (let i = 1; i < doc.codes.length; i++) {
					row = sheet.addRow();
					row.addCell();

					cell = row.addCell();
					cell.value = doc.codes[i].code;
					cell.style =
						styles[i + 1 < height ?
						"code_mid" : "code_bot"];
				};

				height = height || 1;

				row = sheet.addRow();
				end += height;
			});

			for (let i = 0; i < 2; i++) {
				cell = row.addCell();
				cell.style = styles.new.cell_end();
			}

			[{
				style: styles.cell_bottom,
				value: "Sub-Totals"
			}, {
				style: styles.cell_bottom_right,
				formula: "SUM(D" + start + ":D" + (end - height) + ")",
				numFmt: "#,###.00",
				cellType: "TypeFormula"
			}, {
				style: styles.cell_gray
			}, {
				style: styles.cell_bottom_right,
				formula: "SUM(F" + start + ":F" + (end - height) + ")",
				numFmt: "#,###.00",
				cellType: "TypeFormula"
			}].forEach(t => {
				cell = row.addCell();
				cell.vMerge = 1;

				for (let k in t)
					cell[k] = t[k];
			});

			sheet.addRow();
			row = sheet.addRow();

			for (let i = 0; i < 6; i++)
				cell = row.addCell();

			cell.style = styles.new.cell_end();

			for (let i = 0; i < 2; i++)
				row = sheet.addRow();

			[[
				"TOTAL FEES",
				"F" + end
			], [
				(bill.vat*100) + "% VAT",
				"F" + (end + 5) + "*" + bill.vat
			], [
				"GRAND TOTAL",
				"F" + (end + 5) + "+F" + (end + 6),
				styles.thick_bold
			]].forEach(t => {
				row = sheet.addRow();
				cell = row.addCell();
				cell.value = t[0];
				cell.style = styles.default_bold;

				for (let i = 0; i < 5; i++)
					cell = row.addCell();

				cell.formula = t[1];
				cell.numFmt = "#,###.00";
				cell.cellType = "TypeFormula";
				cell.style = t[2] || styles.default_bold;
			});
		}].forEach(fn => {
			row = sheet.addRow();

			if (fn)
				fn(row);
		});

		let stream = file.saveAs()
			.pipe(fs.createWriteStream(path));

		stream.on("error", _ => callback(false));
		stream.on("finish", _ => callback(true));
	};


	mod_excel.generate = (bill, callback) => dialog.showSaveDialog(
		self,
		{
			filters: [{
				name: "Microsoft Excel Worksheet",
				extensions: ["xlsx"]
			}]
		},
		path => path ?
			generate_fn(bill, path, callback) :
			callback()
	);


	mod_excel.fromCSV = path => {
		try {
			let l = [];
			let str = fs.readFileSync(path)
				.toString().split(/\r\n|\n/);

			for (let x in str) if (str[x].length) {
				let n = -1;
				let v = [];
				let i = v.push("") - 1;

				for (let y in str[x]) {
					if (str[x][y] == "," && n) {
						i = v.push("") - 1;
						n = -1;
					} else if (str[x][y] == '"') {
						if (n == 1)
							v[i] += '"';

						n = (n + 1)%2;
					} else
						v[i] += str[x][y];
				}

				l.push(v);
			}

			return l;
		} catch(_) {
			return;
		}
	};
}

spook.return();
