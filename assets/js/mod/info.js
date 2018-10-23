/**
 * Library for functions for the info interface.
 *
 * @author Llyme
**/

const mod_info = {
	/**
	 * Convert minutes into a phrase. Example, 1510 minutes will
	 * return '1 Day, 1 Hour, 10 Minutes'.
	 * @param {Integer} n - Minutes.
	 * @return {String} the phrase you've been waiting for.
	**/
	stats_time_convert: n => {
		let txt = "";

		let f = (v, i) => {
			if (i)
				txt = i + (i > 1 ? v + "s" : v) +
					(txt ? ", " : "") + txt;
		};

		let l = {
			[" Minute"]: Math.floor(n%60),
			[" Hour"]: Math.floor((n/60)%24),
			[" Day"]: Math.floor((n/1440)%365),
			[" Year"]: Math.floor(n/525600)
		};

		for (let i in l)
			f(i, l[i]);

		return txt;
	},
	/**
	 * Update the information interface's accumulated time based on
	 * the given value.
	 *
	 * @param {Array} time - The accumulated time for the currently
	 * selected client's log collection.
	**/
	stats_time_update: time => {
		info_stats_time.innerHTML =
			time ? mod_info.stats_time_convert(time) : "N/A";
	},
	/**
	 * Update the information interface's total logs based on given
	 * list.
	 *
	 * @param {Array} String - The list of all the logs created on
	 * a client.
	**/
	stats_log_update: list => {
		info_stats_log.innerHTML =
			list.length ? list.length + " Log" +
			(list.length > 1 ? "s" : "") : "N/A";
	}
};
