var checkValidity = require('./../schema').checkValidity;
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('dependencies')) {
		return;
	}

	var objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name];

	for (var p in schema.dependencies) {
		if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
			if (Array.isArray(schema.dependencies[p])) {
				for (var i = 0, len = schema.dependencies[p].length; i < len; i++)
					if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
						return { 'dependencies': true };
					}
			} else {
				return checkValidity(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
			}
		}
	}
};