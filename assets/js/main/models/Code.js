/**
 * Codes. Amazing.
 *
 * @author Llyme
**/

module.exports = models => { return {
	code: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: ""
	}
}};
