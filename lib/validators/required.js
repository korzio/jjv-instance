module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!options.checkRequired || !schema.required) {
		return;
	}

	var objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name],
		errors;

	for (var i = 0, len = schema.required.length; i < len; i++) {
		if (!prop.hasOwnProperty(schema.required[i])) {
			errors = errors || {};
			errors[schema.required[i]] = { 'required': true };
		}
	}

	return errors;
};