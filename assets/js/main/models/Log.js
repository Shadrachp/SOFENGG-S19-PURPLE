/**
 * Logs. Interesting.
 *
 * @author Llyme
**/
const mongoose = require("mongoose");

module.exports = models => { return {
	case: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	date: {
		type: String,
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
	lawyer: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	codes: [mongoose.Schema.Types.ObjectId],
	description: {
		type: String,
		default: ""
	},
	billed: {
		type: Boolean,
		default: false,
		required: true
	}
}};
