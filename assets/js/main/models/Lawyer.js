/**
 * Lawyers. Nice.
 *
 * @author Llyme
**/

module.exports = models => { return {
	user: {
		type: require("mongoose").Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 64
	}
}};
