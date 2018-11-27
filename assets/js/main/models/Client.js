/**
 * Clients. Wow.
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
	logs_count: {
		type: Number,
		default: 0,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer."
		}
	}
}};