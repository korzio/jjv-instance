var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('anyOf')) {
		return;
	}

	var objerr,
		newStack = objectStack,
		customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	for (var i = 0, len = schema.anyOf.length; i < len; i++) {
		if(customTypesUsage) {
			newStack = utils.cloneStack(objectStack);
		}

		objerr = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
		if (!objerr) {
			break;
		}
	}

	return objerr;
};