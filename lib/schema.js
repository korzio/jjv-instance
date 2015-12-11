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

	for(i = 0, arr = ['$ref', 'type', 'allOf', 'oneOf', 'anyOf'], len = arr.length; i < len; i++) {
		error = validate(arr[i]);
		if(error) {
			return error;
		}
	}

	if (!options.useCoerce && !options.useDefault && !options.removeAdditional) {
		if (schema.hasOwnProperty('not')) {
			objerr = checkValidity(env, schemaStack.concat(schema.not), objectStack, options);
			if (!objerr)
				return { 'not': true };
		}
	} else {
		if (schema.hasOwnProperty('not')) {
			newStack = utils.cloneStack(objectStack);
			objerr = checkValidity(env, schemaStack.concat(schema.not), newStack, options);
			if (!objerr)
				return { 'not': true };
		}
	}

	if (schema.hasOwnProperty('dependencies')) {
		for (p in schema.dependencies)
			if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
				if (Array.isArray(schema.dependencies[p])) {
					for (i = 0, len = schema.dependencies[p].length; i < len; i++)
						if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
							return { 'dependencies': true };
						}
				} else {
					objerr = checkValidity(env, schemaStack.concat(schema.dependencies[p]), objectStack, options);
					if (objerr)
						return objerr;
				}
			}
	}

	if (!Array.isArray(prop)) {
		props = [];
		objerrs = {};
		for (p in prop)
			if (prop.hasOwnProperty(p))
				props.push(p);

		if (options.checkRequired && schema.required) {
			for (i = 0, len = schema.required.length; i < len; i++)
				if (!prop.hasOwnProperty(schema.required[i])) {
					objerrs[schema.required[i]] = { 'required': true };
					malformed = true;
				}
		}

		hasProp = schema.hasOwnProperty('properties');
		hasPattern = schema.hasOwnProperty('patternProperties');
		if (hasProp || hasPattern) {
			i = props.length;
			while (i--) {
				matched = false;
				if (hasProp && schema.properties.hasOwnProperty(props[i])) {
					matched = true;
					objerr = checkValidity(env, schemaStack.concat(schema.properties[props[i]]), objectStack.concat({ object: prop, key: props[i] }), options);
					if (objerr !== null) {
						objerrs[props[i]] = objerr;
						malformed = true;
					}
				}
				if (hasPattern) {
					for (p in schema.patternProperties)
						if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
							matched = true;
							objerr = checkValidity(env, schemaStack.concat(schema.patternProperties[p]), objectStack.concat({ object: prop, key: props[i] }), options);
							if (objerr !== null) {
								objerrs[props[i]] = objerr;
								malformed = true;
							}
						}
				}
				if (matched)
					props.splice(i, 1);
			}
		}

		if (options.useDefault && hasProp && !malformed) {
			for (p in schema.properties)
				if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
					prop[p] = utils.clone(schema.properties[p]['default']);
		}

		if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
			for (i = 0, len = props.length; i < len; i++)
				delete prop[props[i]];
		} else {
			if (schema.hasOwnProperty('additionalProperties')) {
				if (typeof schema.additionalProperties === 'boolean') {
					if (!schema.additionalProperties) {
						for (i = 0, len = props.length; i < len; i++) {
							objerrs[props[i]] = { 'additional': true };
							malformed = true;
						}
					}
				} else {
					for (i = 0, len = props.length; i < len; i++) {
						objerr = checkValidity(env, schemaStack.concat(schema.additionalProperties), objectStack.concat({ object: prop, key: props[i] }), options);
						if (objerr !== null) {
							objerrs[props[i]] = objerr;
							malformed = true;
						}
					}
				}
			}
		}
		if (malformed)
			return { 'schema': objerrs };
	} else {
		if (schema.hasOwnProperty('items')) {
			if (Array.isArray(schema.items)) {
				for (i = 0, len = schema.items.length; i < len; i++) {
					objerr = checkValidity(env, schemaStack.concat(schema.items[i]), objectStack.concat({ object: prop, key: i }), options);
					if (objerr !== null) {
						objerrs[i] = objerr;
						malformed = true;
					}
				}
				if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
					if (typeof schema.additionalItems === 'boolean') {
						if (!schema.additionalItems)
							return { 'additionalItems': true };
					} else {
						for (i = len, len = prop.length; i < len; i++) {
							objerr = checkValidity(env, schemaStack.concat(schema.additionalItems), objectStack.concat({ object: prop, key: i }), options);
							if (objerr !== null) {
								objerrs[i] = objerr;
								malformed = true;
							}
						}
					}
				}
			} else {
				for (i = 0, len = prop.length; i < len; i++) {
					objerr = checkValidity(env, schemaStack.concat(schema.items), objectStack.concat({ object: prop, key: i }), options);
					if (objerr !== null) {
						objerrs[i] = objerr;
						malformed = true;
					}
				}
			}
		} else if (schema.hasOwnProperty('additionalItems')) {
			if (typeof schema.additionalItems !== 'boolean') {
				for (i = 0, len = prop.length; i < len; i++) {
					objerr = checkValidity(env, schemaStack.concat(schema.additionalItems), objectStack.concat({ object: prop, key: i }), options);
					if (objerr !== null) {
						objerrs[i] = objerr;
						malformed = true;
					}
				}
			}
		}
		if (malformed)
			return { 'schema': objerrs };
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