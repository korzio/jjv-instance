var validate = require('./../validate');

module.exports = function items(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1],
		prop = objectStack[objectStack.length - 1],
		errors, i, len;

	if (!Array.isArray(prop) || !schema.hasOwnProperty('items')) {/*r-condition*/
		return;
	}

	if (Array.isArray(schema.items)) {
		for (i = 0, len = schema.items.length; i < len; i++) {
			errors = validate(env, schemaStack.concat(schema.items[i]), objectStack.concat(prop[i]), options);
			if (errors) {
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
					errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
					if (errors) {
						return errors;
					}
				}
			}
		}
	} else {
		for (i = 0, len = prop.length; i < len; i++) {
			errors = validate(env, schemaStack.concat(schema.items), objectStack.concat(prop), options);
			if (errors) {
				return errors;
			}
		}
	}
};