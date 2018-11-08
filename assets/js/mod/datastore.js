/**
 * Local datastore to prevent mass requests. This is heavily reliant
 * with `relay.js`.
 *
 * @author Llyme
 * @dependencies relay.js
**/

/**
 * Create a new datastore with the given `limit` and `buffer`, along
 * with the `getter` function to request from.
 * USE THE CONSTRUCTOR `new mod_datastore(limit, buffer, getter)`
 *
 * @param {Integer} limit - the total amount this datastore can hold
 * until it would start discarding data.
 *
 * @param {Integer} buffer - the highest amount of data this datastore
 * will request for.
 *
 * @param {Function} getter - this is from the `relay.js`. Use something
 * like `mod_relay.Client.get`.
 *
 * @return {Object} - the datastore instance.
**/
const mod_datastore = function(limit, buffer, getter) {
	if (!getter) return console.error(
		"Datastore must have a `getter` function!"
	);

	limit = limit || 0;
	buffer = buffer || 0;
	let skip = 0;
	let data = 0;

	/**
	 * Load some data from the `getter` function.
	 *
	 * @param {Boolean|null} reverse - if `true`, it will load previous
	 * data that was skipped, otherwise (false or null) it will load
	 * the next data.
	 *
	 * @param {Function(flag, docs)} callback - this is called the
	 * request is done. `flag` will be `true` if it's succesfully
	 * loaded, `false` if nothing happened.
	 * If `flag` is `true`, `docs` will be an `array` of the new
	 * elements that were added.
	**/
	this.load = (reverse, callback) => {
		if (reverse != null && reverse) {
			// Nothing was skipped!
			if (!skip)
				return callback(false);

			// skipped data could be less than the buffer.
			let len = Math.min(skip, buffer);

			getter(skip - len, len)(docs => {
				data += (
					(data + docs.length) > limit ?
					(limit - data) :
					docs.length
				);
				skip -= docs.length;

				callback(true, docs);
			});
		} else
			getter(skip + data, buffer)(docs => {
				data += (
					(data + docs.length) > limit ?
					(limit - data) :
					docs.length
				);
				skip += docs.length;

				callback(true, docs);
			});
	};

	/**
	 * Add some data. This will not go below 0 or higher than the limit.
	 *
	 * @param {Integer} v - the value you want to add. Can be negative.
	**/
	this.add = v =>
		data = Math.max(0, Math.min(limit, data + v));

	this.limit = _ => limit;
	this.buffer = _ => buffer;
	this.skip = _ => skip;
	this.data = _ => data;
};

spook.return();
