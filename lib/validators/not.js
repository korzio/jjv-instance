var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function not(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('not')) {/*r-condition*/
		return;
	}

	var customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional,
		newStack = customTypesUsage ? utils.cloneStack(objectStack) : objectStack,
		errors = validate(env, schemaStack.concat(schema.not), newStack, options);

	if (!errors){
		return { 'not': true };
	}
};