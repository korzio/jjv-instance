var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function anyOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('anyOf')) {/*r-condition*/
		return;
	}

	var errors,
		newStack = objectStack,
		customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	for (var i = 0, len = schema.anyOf.length; i < len; i++) {
		if(customTypesUsage) {
			newStack = utils.clone(objectStack);
		}

		errors = validate(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
		if (!errors) {
			break;
		}
	}

    if(errors) {
	   return errors;
    }
};