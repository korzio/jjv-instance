var checkValidity = require('./../schema').checkValidity;
var utils = require('./../utils');

module.exports = function allOf(env, schemaStack, objectStack, options) {
	var objectStackLast = objectStack.length - 1,
		object = objectStack[objectStackLast].object,
		name = objectStack[objectStackLast].key,
		prop = object[name],
		schema = schemaStack[schemaStack.length - 1],
		hasProp = schema.hasOwnProperty('properties'),
		hasPattern = schema.hasOwnProperty('patternProperties');

	if (Array.isArray(prop)) {
		return;
	}

	var props = [],
		objerrs = {}, objerr, matched, malformed, i, len, p;

	for (p in prop)
		if (prop.hasOwnProperty(p))
			props.push(p);

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

	if (malformed) {
		return { 'schema': objerrs };
	}
};