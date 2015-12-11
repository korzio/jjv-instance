var checkValidity = require('./../schema').checkValidity;
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('anyOf')) {
		return;
	}

	var objerr, objerrs,
		newStack = objectStack,
		minErrCount = Infinity,
		customTypesUsage = options.useCoerce || options.useDefault || options.removeAdditional;

	for (var i = 0, len = schema.anyOf.length; i < len; i++) {
		if(customTypesUsage) {
			newStack = utils.cloneStack(objectStack);
		}

		objerr = checkValidity(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
		if (!objerr) {
			objerrs = null;
			break;
		} else {
			var errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
			if (errCount < minErrCount) {
				minErrCount = errCount;
				objerrs = objerr;
			}
		}
	}

	if (objerrs) {
		return objerrs;
	}
};