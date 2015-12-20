var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function oneOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('oneOf')) {/*r-condition*/
		return;
	}

	var errors,
		newStack = objectStack,
		customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
		if(customTypesUsage) {
			newStack = utils.cloneStack(objectStack);
		}

		errors = validate(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
		if (!errors) {
			if(++count > 1) {
				break;
			} else if(customTypesUsage){
				utils.copyStack(newStack, objectStack);
			}
		}
	}

	if (count > 1) {
		return { 'oneOf': true };
	} else if (count < 1) {
		return errors;
	}
};