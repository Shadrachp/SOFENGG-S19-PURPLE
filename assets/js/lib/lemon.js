/**
 * General-purpose function library, just like when life gives you
 * lemons!
 *
 * lemon.time.toMilitary(String time)
 * lemon.time.toMilitary_split(String time)
 * lemon.time.toStandard(String time)
 * lemon.time.toStandard_split(String time)
 *
 * @author Llyme
**/
const lemon = {
	time: {}
};

{
	let literals = [];
	let str = "\\.[](){}^|$+-*/?!,=:";

	for (let i = 0; i < str.length; i++) {
		let v = "\\" + str[i];

		literals.push([new RegExp(v, "g"), v]);
	}

	/**
	 * Avoid regular expression from triggering certain symbols by
	 * escaping them.
	**/
	lemon.literalRegExp = str => {
		literals.forEach(v => str = str.replace(v[0], v[1]));

		return str;
	};
}

/**
 * See if 2 ranges of time overlap with each other. All must be
 * converted to minutes.
 *
 * @param {Number} start0 - 1st starting time.
 * @param {Number} end0 - 1st ending time.
 * @param {Number} start1 - 2nd starting time.
 * @param {Number} end1 - 2nd ending time.
 * @return {Number} -2 if invalid, -1 if doesn't intersect, otherwise
 * the total time that overlapped. 0 is still considered overlapping.
**/
lemon.intersectRange = (start0, end0, start1, end1) => {
	if (start0 > end0 || start1 > end1)
		return -2;

	// Range value of 0.
	if (start0 == end0)
		return start0 >= start1 && start0 <= end1 ? 0 : -1;
	else if (start1 == end1)
		return start1 >= start0 && start1 <= end0 ? 0 : -1;

	let n = start0 < start1 ?
		Math.min(end0 - start1, end1 - start1) :
		Math.min(end1 - start0, end0 - start0);
	return n <= 0 ? -1 : n;
};

/**
 * Get standard time from minutes.
 *
 * @param {Integer} time - The time.
 * @return {String} The output.
**/
lemon.time.minutesToStandard = time => {
	let hr = Math.floor(time/60);
	let mn = time%60;
	let md = hr >= 12 ? " PM" : " AM";
	hr = !hr ? 12 : hr > 12 ? (hr - 12) : hr;

	return ("00" + hr).slice(-2) + ":" + ("00" + mn).slice(-2) + md; 
};

/**
 * Fix the string so that it follows the 12-hour format.
 *
 * If hour is less than 0 or greater than 12, it will be constrained to
 * within range.
 *
 * If minute is less than 0 or greater than 59, it will be constrained
 * to within range.
 *
 * If meridiem is not found, it will be set to 'AM'. Meridiem must be
 * `AM` or `PM`, case-insensitive.
 *
 * @param {String} time - Time in 12-hour format.
 *
 * @return {String|null} - the converted format.
**/
lemon.time.fixStandard = time => {
	try {
		time = time.substr(time.search(/\d/));
		let i = time.indexOf(":");

		let hr = Math.max(1, Math.min(12, Number(time.substr(0, i))));

		time = time.substr(i + 1);
		i = time.search(/\D/);

		let mn = Math.max(0, Math.min(59, Number(time.substr(
				0,
				i == -1 ? undefined : i
			))));

		return ("00" + hr).slice(-2) + ":" +
			("00" + mn).slice(-2) + " " +
			(time.search(/PM/i) > -1 ? "PM" : "AM");
	} catch(err) {}
};

/**
 * Convert 12-hour format to 24-hour format.
 * To the boot camp you go, maggot!
 *
 * @param {String} time - Time in 12-hour format.
 * Should be something like `12:59 AM`. Meridiem should be
 * `AM` or `PM`, otherwise it will be processed as `AM` by
 * default if not present or incorrect.
 * @return {String|null} - the converted format. If anything
 * goes wrong, it will return `null`.
**/
lemon.time.toMilitary = time => {
	time = lemon.time.toMilitary_split(time);

	if (!time)
		return;

	return ("00" + time[0]).slice(-2) + ":" +
			("00" + time[1]).slice(-2);
};

/**
 * like `toMilitary()`, but returns the hour and minute
 * separated.
 *
 * @param {String} time - the time in 12-hour format.
 * @return {Array|null} - index 0 is the hour, while index 1
 * is the minute. If anything goes wrong, it will return
 * `null`.
**/
lemon.time.toMilitary_split = time => {
	try {
		time = time.substr(time.search(/\d/));
		let i = time.indexOf(":");

		let hr = Math.max(1, Math.min(12, Number(time.substr(0, i))));

		time = time.substr(i + 1);
		i = time.search(/\D/);

		let mn = Math.max(0, Math.min(59, Number(time.substr(
				0,
				i == -1 ? undefined : i
			))));

		if (time.toUpperCase().indexOf("PM") > -1) {
			if (hr != 12)
				hr += 12;
		} else if (hr == 12)
			hr = 0;

		return [hr, mn];
	} catch(err) {}
};

/**
 * Convert 24-hour format to 12-hour format. Civil order.
 *
 * @param {String} time - Time in 24-hour format.
 * @return {String | null} the converted format. If anything
 * goes wrong, it will return `null`.
**/
lemon.time.toStandard = time => {
	try {
		time = time.substr(time.search(/\d/));
		let i = time.indexOf(":");
		let hr = Math.max(0, Math.min(23, Number(time.substr(0, i))));

		time = time.substr(i + 1);
		i = time.search(/\D/);
		let mn = Math.max(0, Math.min(59, Number(time.substr(
				0,
				i == -1 ? undefined : i
			))));

		let md = " AM";

		if (!hr)
			hr = 12;
		else if (hr > 11)
			md = " PM";

		if (hr > 12)
			hr = hr - 12;

		return ("00" + hr).slice(-2) + ":" +
			("00" + mn).slice(-2) + md;
	} catch(err) {
		return null;
	}
};

spook.return();
