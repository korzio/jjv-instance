var validate = require('./../validate');

module.exports = function additionalItems(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1],
		prop = objectStack[objectStack.length - 1];

	if (!schema.additionalItems || Array.isArray(prop) || typeof schema.additionalItems === 'boolean') {/*r-condition*/
		return;
	}

    var errors = validate(env, schemaStack.concat(schema.additionalItems), objectStack.concat(prop), options);
    if (errors) {
        return errors;
    }
};