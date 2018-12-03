const xlsx = require("xlsx");
const better_xlsx = require("better-xlsx");

{
	let fs = require('fs');
	let xlsx = require('better-xlsx');

	let file = new xlsx.File();
	console.log(file)
	let row, cell;
	let sheet = file.addSheet('Sheet1');
	console.log(sheet)

	row = sheet.addRow();
	console.log(row)
	cell = row.addCell();
	console.log(cell)

	cell.value = 'Time Sheet';
	cell.hMerge = 6;

	const style = new xlsx.Style();
	console.log(style)

	style.fill.patternType = 'solid';
	style.fill.fgColor = '00FF0000';
	style.fill.bgColor = 'FF000000';
	style.align.h = 'center';
	style.align.v = 'center';

	cell.style = style;

	row = sheet.addRow();
	cell = row.addCell();
	cell.value = "(client)";

	file
	  .saveAs()
	  .pipe(fs.createWriteStream('test.xlsx'))
	  .on('finish', () => console.log('Done.'));
}

spook.return();
