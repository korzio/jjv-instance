var validate = require('./../validate');
var resolve = require('./../resolve');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('$ref')) {
		return;
	}

	schemaStack = resolve(env, schemaStack, schema.$ref);
	if (!schemaStack) {
		return { '$ref': schema.$ref };
	}

	return validate(env, schemaStack, objectStack, options);
};