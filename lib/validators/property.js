var keywords = require('./../keywords.json');
var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function property(env, schemaStack, objectStack, options) {
	var prop = objectStack[objectStack.length - 1],
		schema = schemaStack[schemaStack.length - 1],
		errors = {};

	for (var v in schema) {
		if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
			if (v === 'format') {
				if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
					errors[v] = true;
					return errors;
				}
			} else {
				var useSchemaStack = schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v];

				if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, useSchemaStack, schema, objectStack, options)) {
					errors[v] = true;
					return errors;
				}
			}
		}
	}
};