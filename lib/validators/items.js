var validate = require('./../validate');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1],
		objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name],
		errors, i, len;

	if (!Array.isArray(prop) || !schema.hasOwnProperty('items')) {
		return;
	}

	if (Array.isArray(schema.items)) {
		for (i = 0, len = schema.items.length; i < len; i++) {
			errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat({ object: prop, key: i }), options);
			if (errors !== null) {
				return errors;
			}
		}

		if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
			if (typeof schema.additionalItems === 'boolean') {
				if (!schema.additionalItems) {
					return { 'additionalItems': true };
				}
			} else {
				for (i = len, len = prop.length; i < len; i++) {
					errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat({ object: prop, key: i }), options);
					if (errors !== null) {
						return errors;
					}
				}
			}
		}
	} else {
		for (i = 0, len = prop.length; i < len; i++) {
			errors = validate(env, schemaStack.concat(schema.items), objectStack.concat({ object: prop, key: i }), options);
			if (errors !== null) {
				return errors;
			}
		}
	}

	return errors;
};