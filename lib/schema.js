var keywords = require('./keywords.json');
var utils = require('./utils');

var resolveURI = function (env, schema_stack, uri) {
	var curschema, components, hash_idx, name;

	hash_idx = uri.indexOf('#');

	if (hash_idx === -1) {
		if (!env.schema.hasOwnProperty(uri))
			return null;
		return [env.schema[uri]];
	}

	if (hash_idx > 0) {
		name = uri.substr(0, hash_idx);
		uri = uri.substr(hash_idx + 1);
		if (!env.schema.hasOwnProperty(name)) {
			if (schema_stack && schema_stack[0].id === name)
				schema_stack = [schema_stack[0]];
			else
				return null;
		} else
			schema_stack = [env.schema[name]];
	} else {
		if (!schema_stack)
			return null;
		uri = uri.substr(1);
	}

	if (uri === '')
		return [schema_stack[0]];

	if (uri.charAt(0) === '/') {
		uri = uri.substr(1);
		curschema = schema_stack[0];
		components = uri.split('/');
		while (components.length > 0) {
			if (!curschema.hasOwnProperty(components[0]))
				return null;
			curschema = curschema[components[0]];
			schema_stack.push(curschema);
			components.shift();
		}
		return schema_stack;
	} else // FIX: should look for subschemas whose id matches uri
		return null;
};

var resolveObjectRef = function (object_stack, uri) {
	var components, object, last_frame = object_stack.length - 1, skip_frames, frame, m = /^(\d+)/.exec(uri);

	if (m) {
		uri = uri.substr(m[0].length);
		skip_frames = parseInt(m[1], 10);
		if (skip_frames < 0 || skip_frames > last_frame)
			return;
		frame = object_stack[last_frame - skip_frames];
		if (uri === '#')
			return frame.key;
	} else
		frame = object_stack[0];

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

var checkValidity = function (env, schema_stack, object_stack, options) {
	var i, len, count, hasProp, hasPattern;
	var p, v, malformed = false, objerrs = {}, objerr, props, matched;
	var sl = schema_stack.length - 1, schema = schema_stack[sl], new_stack;
	var ol = object_stack.length - 1, object = object_stack[ol].object, name = object_stack[ol].key, prop = object[name];
	var errCount, minErrCount;

	if (schema.hasOwnProperty('$ref')) {
		schema_stack = resolveURI(env, schema_stack, schema.$ref);
		if (!schema_stack)
			return { '$ref': schema.$ref };
		else
			return checkValidity(env, schema_stack, object_stack, options);
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
			objerr = checkValidity(env, schema_stack.concat(schema.allOf[i]), object_stack, options);
			if (objerr)
				return objerr;
		}
	}

	if (!options.useCoerce && !options.useDefault && !options.removeAdditional) {
		if (schema.hasOwnProperty('oneOf')) {
			minErrCount = Infinity;
			for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
				objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), object_stack, options);
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
				objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), object_stack, options);
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
			objerr = checkValidity(env, schema_stack.concat(schema.not), object_stack, options);
			if (!objerr)
				return { 'not': true };
		}
	} else {
		if (schema.hasOwnProperty('oneOf')) {
			minErrCount = Infinity;
			for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
				new_stack = utils.clone_stack(object_stack);
				objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), new_stack, options);
				if (!objerr) {
					count = count + 1;
					if (count > 1)
						break;
					else
						utils.copy_stack(new_stack, object_stack);
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
				new_stack = utils.clone_stack(object_stack);
				objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), new_stack, options);
				if (!objerr) {
					utils.copy_stack(new_stack, object_stack);
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
			new_stack = utils.clone_stack(object_stack);
			objerr = checkValidity(env, schema_stack.concat(schema.not), new_stack, options);
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
					objerr = checkValidity(env, schema_stack.concat(schema.dependencies[p]), object_stack, options);
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
					objerr = checkValidity(env, schema_stack.concat(schema.properties[props[i]]), object_stack.concat({ object: prop, key: props[i] }), options);
					if (objerr !== null) {
						objerrs[props[i]] = objerr;
						malformed = true;
					}
				}
				if (hasPattern) {
					for (p in schema.patternProperties)
						if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
							matched = true;
							objerr = checkValidity(env, schema_stack.concat(schema.patternProperties[p]), object_stack.concat({ object: prop, key: props[i] }), options);
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
						objerr = checkValidity(env, schema_stack.concat(schema.additionalProperties), object_stack.concat({ object: prop, key: props[i] }), options);
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
					objerr = checkValidity(env, schema_stack.concat(schema.items[i]), object_stack.concat({ object: prop, key: i }), options);
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
							objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({ object: prop, key: i }), options);
							if (objerr !== null) {
								objerrs[i] = objerr;
								malformed = true;
							}
						}
					}
				}
			} else {
				for (i = 0, len = prop.length; i < len; i++) {
					objerr = checkValidity(env, schema_stack.concat(schema.items), object_stack.concat({ object: prop, key: i }), options);
					if (objerr !== null) {
						objerrs[i] = objerr;
						malformed = true;
					}
				}
			}
		} else if (schema.hasOwnProperty('additionalItems')) {
			if (typeof schema.additionalItems !== 'boolean') {
				for (i = 0, len = prop.length; i < len; i++) {
					objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({ object: prop, key: i }), options);
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
				if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, object_stack, options)) {
					objerrs[v] = true;
					malformed = true;
				}
			} else {
				if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, schema[v].hasOwnProperty('$data') ? resolveObjectRef(object_stack, schema[v].$data) : schema[v], schema, object_stack, options)) {
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