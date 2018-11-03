/**
 * Codes. Amazing.
 *
 * @author Llyme
**/

module.exports = models => { return {
	data: {
		type: String,
		required: true,
		unique: true,
		minlength: 4,
		maxlength: 24
	},
	logs: [models.Log.schema]
}};
