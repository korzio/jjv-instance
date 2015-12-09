var checkValidity = require('./../schema').checkValidity;

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('allOf')) {
		return;
	}

	for (var i = 0, len = schema.allOf.length; i < len; i++) {
		var objerr = checkValidity(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
		if (objerr) {
			return objerr;
		}
	}
};