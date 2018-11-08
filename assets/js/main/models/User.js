/**
 * Users. Fascinating.
 *
 * @author Llyme
**/

module.exports = models => { return {
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 4,
		maxlength: 24
	},
	password: {
		type: String,
		required: true
	}
}};
