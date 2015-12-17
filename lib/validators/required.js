module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1],
		prop = objectStack[objectStack.length - 1],
		errors;

	if (!options.checkRequired || !schema.required || Array.isArray(prop)) {
		return;
	}

	for (var i = 0, len = schema.required.length; i < len; i++) {
		if (!prop.hasOwnProperty(schema.required[i])) {
			errors = errors || {};
			errors[schema.required[i]] = { 'required': true };
		}
	}

	return errors;
};