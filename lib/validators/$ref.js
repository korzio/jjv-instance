var checkValidity = require('./../schema').checkValidity;
var resolveURI = require('./../schema').resolveURI;

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('$ref')) {
		return;
	}

	schemaStack = resolveURI(env, schemaStack, schema.$ref);
	if (!schemaStack) {
		return { '$ref': schema.$ref };
	}

	return checkValidity(env, schemaStack, objectStack, options);
};