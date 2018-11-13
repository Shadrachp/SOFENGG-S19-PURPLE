/**
 * Clients. Wow.
 *
 * @author Llyme
**/

module.exports = models => { return {
	name: {
		type: String,
		required: true,
		unique: true,
		minlength: 2,
		maxlength: 64
	},
	time: {
		type: Number,
		default: 0,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer."
		}
	},
	logs: [models.Log.schema]
}};
