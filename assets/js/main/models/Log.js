/**
 * Logs. Interesting.
 *
 * @author Llyme
**/

module.exports = models => { return {
	date: {
		type: Date,
		required: true
	},
	time_start: {
		// In minutes.
		type: Number,
		required: true,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer."
		}
	},
	time_end: {
		// In minutes.
		type: Number,
		required: true,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer."
		}
	},
	lawyer: require("mongoose").Schema.Types.ObjectId,
	code: [String]
}};
