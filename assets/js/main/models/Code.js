/**
 * Codes. Amazing.
 *
 * @author Llyme
**/

module.exports = models => { return {
	code: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		default: ""
	}
}};
