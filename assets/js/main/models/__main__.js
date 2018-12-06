/**
 * Make some models and schemas. Yes.
 * The file name itself (minus the extension `.js`) is the model's name.
 *
 * @author Llyme
**/
const mongoose = require("mongoose");

const models = {};




//-- Operations for manipulating models/documents. --//

// There must be no empty arguments, otherwise bad things will happen.
const operations = {
	/**
	 * Create a new document for the designated model.
	**/
	new: (props, callback, model) => { try {
		new model(props).save().then(
			doc => callback(doc)
		);
	} catch(_) {
		callback();
	} }
};




//-- Melee Initialization --//

// Grab them juicy models.
let list = ["Client", "Code", "Lawyer", "Log", "User", "Case"];

// Loop through all the models and 'try' to load them.
while (list.length) {
	list = list.filter(v => { try {
		let schema = mongoose.Schema(
			/* Pass the `models` variable so that they can make use
			   of other models' schema.
			*/
			require("./" + v + ".js")(models)
		);
		let model = mongoose.model(v, schema);
		model.schema = schema;

		// Add the operators for ease of use.
		for (let k in operations)
			model[k] = function() {
				// Nifty argument-passing.
				arguments[arguments.length] = model;
				arguments.length++;

				operations[k].apply(null, arguments);
			};

		// Into the list you go!
		models[v] = model;
	} catch(_) {
		/* Something bad happened. Most likely that the model is
		   dependent on another one. We'll re-loop again after the
		   rest are tried. Only the ones that weren't able to load
		   are re-loaded.
		*/
		return 1;
	}});
}

module.exports = models;