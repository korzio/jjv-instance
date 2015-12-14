var keywords = require('./../keywords.json');
var validate = require('./../validate');
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name],
		schema = schemaStack[schemaStack.length - 1],
		objerrs = {}, malformed;

	for (var v in schema) {
		if (schema.hasOwnProperty(v) && !keywords.hasOwnProperty(v)) {
			if (v === 'format') {
				if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, objectStack, options)) {
					objerrs[v] = true;
					malformed = true;
				}
			} else {
				if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, schema[v].hasOwnProperty('$data') ? utils.resolveObjectRef(objectStack, schema[v].$data) : schema[v], schema, objectStack, options)) {
					objerrs[v] = true;
					malformed = true;
				}
			}
		}
	}

	if (malformed) {
		return { 'schema': objerrs };
	}
};