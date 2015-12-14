var keywords = require('./keywords.json');
var utils = require('./utils');

var checkValidity = function (env, schemaStack, objectStack, options) {
	var i, len, count, hasProp, hasPattern, arr;
	var p, v, malformed = false, objerrs = {}, objerr, props, matched;
	var schemaStackLast = schemaStack.length - 1, schema = schemaStack[schemaStackLast], newStack;
	var objectStackLast = objectStack.length - 1, object = objectStack[objectStackLast].object, name = objectStack[objectStackLast].key, prop = object[name];
	var errCount, minErrCount, error;

	function validate(validatorName){
		var error = require('./validators/' + validatorName)(env, schemaStack, objectStack, options);
		return error;
	}

	for(i = 0, arr = [
		'$ref',
		'type',
		'allOf',
		'oneOf',
		'anyOf',
		'not',
		'dependencies',
		'required',
		'properties',
		'items',
		'additionalItems'
	], len = arr.length; i < len; i++) {
		error = validate(arr[i]);
		if(error) {
			return error;
		}
	}

	for (v in schema) {
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

	if (malformed)
		return objerrs;
	else
		return null;
};

module.exports = {
	resolveURI: require('./resolve'),
	checkValidity: checkValidity
};