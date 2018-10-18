/**
 * Store objects in an orderly fashion.
 *
 * @author Llyme
 * @dependencies viscount.js
**/

const fridge = {
	// List of objects being stored. Do not touch, use `get` instead.
	list: {},
	/**
	 * Store data and give it a UID.
	 *
	 * @param {Anything} data - the data to be stored for safe-keeping.
	 * @return {Integer} the ID.
	**/
	new: data => {
		if (data == null)
			return;

		let id = viscount();

		list[id] = data;

		return id;
	},
	/**
	 * Get the data you just stored.
	 *
	 * @param {Integer} id - the ID.
	 * @return {Anything} your data, otherwise it returns `null`.
	**/
	get: id => list[id],
	/**
	 * Get rid of your data's entry. This will not delete your data,
	 * unless you have no variables pointing to it.
	 *
	 * @param {Integer} id - the ID.
	 * @return {Boolean} returns `true` if successful, otherwise `false`
	 * if non-existent.
	**/
	del: id => (list[id] != null ?
		(viscount(id) || delete list[id]) : false)
};