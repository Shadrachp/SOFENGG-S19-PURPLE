/**
 * Lawyers. Nice.
 *
 * @author Llyme
**/

module.exports = models => { return {
	name: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 24
	}
}};
