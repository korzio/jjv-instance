var checkValidity = require('./../schema').checkValidity;

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('oneOf')) {
		return;
	}

	for (var i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
		var objerr = checkValidity(env, schemaStack.concat(schema.oneOf[i]), objectStack, options);

		if (!objerr && ++count > 1) {
			break;
		}
	}

	if (count > 1) {
		return { 'oneOf': true };
	} else if (count < 1) {
		return objerr;
	}
};