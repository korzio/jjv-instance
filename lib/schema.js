var keywords = require('./keywords.json');
var utils = require('./utils');

var resolveURI = function (env, schemaStack, uri) {
	var curschema, components, hashIdx, name;

	hashIdx = uri.indexOf('#');

	if (hashIdx === -1) {
		if (!env.schema.hasOwnProperty(uri))
			return null;
		return [env.schema[uri]];
	}

	if (hashIdx > 0) {
		name = uri.substr(0, hashIdx);
		uri = uri.substr(hashIdx + 1);
		if (!env.schema.hasOwnProperty(name)) {
			if (schemaStack && schemaStack[0].id === name)
				schemaStack = [schemaStack[0]];
			else
				return null;
		} else
			schemaStack = [env.schema[name]];
	} else {
		if (!schemaStack)
			return null;
		uri = uri.substr(1);
	}

	if (uri === '')
		return [schemaStack[0]];

	if (uri.charAt(0) === '/') {
		uri = uri.substr(1);
		curschema = schemaStack[0];
		components = uri.split('/');
		while (components.length > 0) {
			if (!curschema.hasOwnProperty(components[0]))
				return null;
			curschema = curschema[components[0]];
			schemaStack.push(curschema);
			components.shift();
		}
		return schemaStack;
	} else // FIX: should look for subschemas whose id matches uri
		return null;
};

var resolveObjectRef = function (objectStack, uri) {
	var components, object, lastFrame = objectStack.length - 1, skipFrames, frame, m = /^(\d+)/.exec(uri);

	if (m) {
		uri = uri.substr(m[0].length);
		skipFrames = parseInt(m[1], 10);
		if (skipFrames < 0 || skipFrames > lastFrame)
			return;
		frame = objectStack[lastFrame - skipFrames];
		if (uri === '#')
			return frame.key;
	} else
		frame = objectStack[0];

	object = frame.object[frame.key];

	if (uri === '')
		return object;

	if (uri.charAt(0) === '/') {
		uri = uri.substr(1);
		components = uri.split('/');
		while (components.length > 0) {
			components[0] = components[0].replace(/~1/g, '/').replace(/~0/g, '~');
			if (!object.hasOwnProperty(components[0]))
				return;
			object = object[components[0]];
			components.shift();
		}
		return object;
	} else
		return;
};

var checkValidity = function (env, schemaStack, objectStack, options) {
	var i, len, count, hasProp, hasPattern;
	var p, v, malformed = false, objerrs = {}, objerr, props, matched;
	var sl = schemaStack.length - 1, schema = schemaStack[sl], newStack;
	var ol = objectStack.length - 1, object = objectStack[ol].object, name = objectStack[ol].key, prop = object[name];
	var errCount, minErrCount;

	if (schema.hasOwnProperty('$ref')) {
		schemaStack = resolveURI(env, schemaStack, schema.$ref);
		if (!schemaStack)
			return { '$ref': schema.$ref };
		else
			return checkValidity(env, schemaStack, objectStack, options);
	}

	if (schema.hasOwnProperty('type')) {
		if (typeof schema.type === 'string') {
			if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type))
				prop = object[name] = env.coerceType[schema.type](prop);
			if (!env.fieldType[schema.type](prop))
				return { 'type': schema.type };
		} else {
			malformed = true;
			for (i = 0, len = schema.type.length; i < len && malformed; i++)
				if (env.fieldType[schema.type[i]](prop))
					malformed = false;
			if (malformed)
				return { 'type': schema.type };
		}
	}

	if (schema.hasOwnProperty('allOf')) {
		for (i = 0, len = schema.allOf.length; i < len; i++) {
			objerr = checkValidity(env, schemaStack.concat(schema.allOf[i]), objectStack, options);
			if (objerr)
				return objerr;
		}
	}

	if (!options.useCoerce && !options.useDefault && !options.removeAdditional) {
		if (schema.hasOwnProperty('oneOf')) {
			minErrCount = Infinity;
			for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
				objerr = checkValidity(env, schemaStack.concat(schema.oneOf[i]), objectStack, options);
				if (!objerr) {
					count = count + 1;
					if (count > 1)
						break;
				} else {
					errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
					if (errCount < minErrCount) {
						minErrCount = errCount;
						objerrs = objerr;
					}
				}
			}
			if (count > 1)
				return { 'oneOf': true };
			else if (count < 1)
				return objerrs;
			objerrs = {};
		}

		if (schema.hasOwnProperty('anyOf')) {
			objerrs = null;
			minErrCount = Infinity;
			for (i = 0, len = schema.anyOf.length; i < len; i++) {
				objerr = checkValidity(env, schemaStack.concat(schema.anyOf[i]), objectStack, options);
				if (!objerr) {
					objerrs = null;
					break;
				}
				else {
					errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
					if (errCount < minErrCount) {
						minErrCount = errCount;
						objerrs = objerr;
					}
				}
			}
			if (objerrs)
				return objerrs;
		}

		if (schema.hasOwnProperty('not')) {
			objerr = checkValidity(env, schemaStack.concat(schema.not), objectStack, options);
			if (!objerr)
				return { 'not': true };
		}
	} else {
		if (schema.hasOwnProperty('oneOf')) {
			minErrCount = Infinity;
			for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
				newStack = utils.cloneStack(objectStack);
				objerr = checkValidity(env, schemaStack.concat(schema.oneOf[i]), newStack, options);
				if (!objerr) {
					count = count + 1;
					if (count > 1)
						break;
					else
						utils.copyStack(newStack, objectStack);
				} else {
					errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
					if (errCount < minErrCount) {
						minErrCount = errCount;
						objerrs = objerr;
					}
				}
			}
			if (count > 1)
				return { 'oneOf': true };
			else if (count < 1)
				return objerrs;
			objerrs = {};
		}

		if (schema.hasOwnProperty('anyOf')) {
			objerrs = null;
			minErrCount = Infinity;
			for (i = 0, len = schema.anyOf.length; i < len; i++) {
				newStack = utils.cloneStack(objectStack);
				objerr = checkValidity(env, schemaStack.concat(schema.anyOf[i]), newStack, options);
				if (!objerr) {
					utils.copyStack(newStack, objectStack);
					objerrs = null;
					break;
				}
				else {
					errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
					if (errCount < minErrCount) {
						minErrCount = errCount;
						objerrs = objerr;
					}
				}
			}
			if (objerrs)
				return objerrs;
		}

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
				if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, schema[v].hasOwnProperty('$data') ? resolveObjectRef(objectStack, schema[v].$data) : schema[v], schema, objectStack, options)) {
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
	resolveURI: resolveURI,
	checkValidity: checkValidity
};