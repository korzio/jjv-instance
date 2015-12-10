var checkValidity = require('./../schema').checkValidity;
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('oneOf')) {
		return;
	}

	var customTypeCoercion = options.useCoerce || options.useDefault || options.removeAdditional,
		newStack = objectStack,
		objerr;

	for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
		if (customTypeCoercion) {
			newStack = utils.cloneStack(objectStack);
		}

		objerr = checkValidity(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
		if (!objerr) {
			if (++count > 1) {
				break;
			} else if (customTypeCoercion) {
				utils.copyStack(newStack, objectStack);
			}
		}
	}

	if (count > 1) {
		return { 'oneOf': true };
	} else if (count < 1) {
		return objerr;
	}
};