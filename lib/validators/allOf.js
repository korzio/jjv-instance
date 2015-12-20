var validate = require('./../validate');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('allOf')) {/*r-condition*/
		return;
	}

	for (var i = 0, len = schema.allOf.length; i < len; i++) {
		var errors = validate(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
		if (errors) {
			return errors;
		}
	}
};