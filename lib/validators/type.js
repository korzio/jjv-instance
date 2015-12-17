module.exports = function type(env, schemaStack, objectStack, options) {
	var schema = schemaStack[schemaStack.length - 1];
	if (!schema.hasOwnProperty('type')) {
		return;
	}

	var prop = objectStack[objectStack.length - 1];

	if (typeof schema.type === 'string') {
		if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type)) {
			prop = env.coerceType[schema.type](prop);
		}
		if (!env.fieldType[schema.type](prop)) {
			return { 'type': schema.type };
		}
	} else if(Array.isArray(schema.type)){
		for (var i = 0, len = schema.type.length; i < len; i++) {
			if (env.fieldType[schema.type[i]](prop)) {
				return;
			}
		}

		return { 'type': schema.type };
	}
};