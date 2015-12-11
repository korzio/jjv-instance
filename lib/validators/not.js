var checkValidity = require('./../schema').checkValidity;
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('not')) {
		return;
	}

	var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
		newStack = customTypesUsage ? utils.cloneStack(objectStack) : objectStack,
		objerr = checkValidity(env, schemaStack.concat(schema.not), newStack, options);

	if (!objerr){
		return { 'not': true };
	}
};