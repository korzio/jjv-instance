var checkValidity = require('./../schema').checkValidity;

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1],
		objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name];

	if (!schema.additionalItems || Array.isArray(prop) || typeof schema.additionalItems === 'boolean') {
		return;
	}

	for (var i = 0, len = prop.length; i < len; i++) {
		var errors = checkValidity(env, schemaStack.concat(schema.additionalItems), objectStack.concat({ object: prop, key: i }), options);
		if (errors !== null) {
			return errors;
		}
	}
};