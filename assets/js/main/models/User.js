/**
 * Users. Fascinating.
 *
 * @author Llyme
**/

module.exports = models => { return {
	name: {
		type: String,
		required: true,
		unique: true,
		minlength: 4,
		maxlength: 24
	},
	password: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 24
	}
}};
