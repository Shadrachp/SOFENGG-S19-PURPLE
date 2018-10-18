/**
 * Recyclable UID generator.
 *
 * @author Llyme
**/

/**
 * Generate an ID number.
 *
 * @param {Integer | null} i - if provided with an existing ID, it will
 * remove that ID from that list and allow usage when this function is
 * called again. Leaving it `null` or empty will generate a new ID.
 * Lowest unused ID number is prioritized when generating a number.
**/
const viscount = i => {
	if (i == null)
		return viscount.lo.length ?
			viscount.lo.pop() :
			viscount.hi++;
	else (
		i >= viscount.hi ? (
			i < viscount.hi - 1 ?
			viscount.lo.push(i) :
			viscount.hi--
		) : 0
	);
};

viscount.hi = 0;
viscount.lo = [];
